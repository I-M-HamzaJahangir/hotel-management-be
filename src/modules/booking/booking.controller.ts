import { Request, Response } from "express";
import { RoomType } from "../room-type/roomType.model";
import createHttpError from "http-errors";
import { BOOKING_STATUS, HTTP_STATUS } from "../../constants/constant";
import { normalizeDate } from "../../utils/date.utils";
import { Booking } from "./booking.model";
import { Room } from "../room/room.model";
import { differenceInCalendarDays } from "date-fns";
import { canTransition, sendSuccess } from "../../utils/helper";
import { USER_ROLES } from "../../constants/role";

const create = async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const { roomType, guestCount, checkIn, checkOut } = req.body;
  const checkInDate = normalizeDate(checkIn);
  const checkOutDate = normalizeDate(checkOut);

  const roomTypeExist = await RoomType.findOne({
    _id: roomType,
    isActive: true,
  });

  if (!roomTypeExist) {
    throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Room type does not exist.");
  }

  if (guestCount > roomTypeExist.capacity) {
    throw createHttpError(
      HTTP_STATUS.BAD_REQUEST,
      `This room type allows up to ${roomTypeExist.capacity} guests.`,
    );
  }
  const totalRooms = await Room.countDocuments({
    roomType: roomType,
    deletedAt: null,
  });
  if (totalRooms === 0) {
    throw createHttpError(
      HTTP_STATUS.BAD_REQUEST,
      "No rooms available for this type",
    );
  }

  const overlappingCount = await Booking.countDocuments({
    roomType,
    status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CHECKED_IN] },
    checkIn: { $lt: checkOutDate },
    checkOut: { $gt: checkInDate },
  });

  if (overlappingCount >= totalRooms) {
    throw createHttpError(
      HTTP_STATUS.CONFLICT,
      "No rooms of this type are available for the selected dates",
    );
  }

  const nights = differenceInCalendarDays(checkOutDate, checkInDate);

  const booking = await Booking.create({
    user: userId,
    roomType,
    guestCount,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    snapshot: {
      roomTypeName: roomTypeExist.name,
      pricePerNight: roomTypeExist.basePrice,
      nights,
      totalPrice: roomTypeExist.basePrice * nights,
    },
  });

  return sendSuccess(
    res,
    "Booking created successfully",
    booking,
    HTTP_STATUS.CREATED,
  );
};

const checkIn = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { room: roomId } = req.body;

  const booking = await Booking.findById(id);
  if (!booking)
    throw createHttpError(HTTP_STATUS.NOT_FOUND, "Booking not found!");

  if (!canTransition(booking.status, BOOKING_STATUS.CHECKED_IN)) {
    throw createHttpError(
      HTTP_STATUS.CONFLICT,
      `Cannot check in a booking that is ${booking.status}`,
    );
  }

  const room = await Room.findOne({
    _id: roomId,
    roomType: booking.roomType,
    deletedAt: null,
  });
  if (!room) {
    throw createHttpError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid room for this booking",
    );
  }

  const clash = await Booking.exists({
    room: roomId,
    status: { $in: [BOOKING_STATUS.CHECKED_IN] },
    checkIn: { $lt: booking.checkOut },
    checkOut: { $gt: booking.checkIn },
  });
  if (clash) {
    throw createHttpError(
      HTTP_STATUS.CONFLICT,
      "That room is occupied for these dates",
    );
  }

  booking.room = roomId;
  booking.status = BOOKING_STATUS.CHECKED_IN;
  booking.snapshot.roomNumber = room.roomNumber;
  await booking.save();

  return sendSuccess(res, "Guest checked in", booking);
};

const checkOut = async (req: Request, res: Response) => {
  const { id } = req.params;

  const booking = await Booking.findById(id);
  if (!booking)
    throw createHttpError(HTTP_STATUS.NOT_FOUND, "Booking not found!");

  if (!canTransition(booking.status, BOOKING_STATUS.CHECKED_OUT)) {
    throw createHttpError(
      HTTP_STATUS.CONFLICT,
      `Cannot check out a booking that is ${booking.status}`,
    );
  }

  booking.status = BOOKING_STATUS.CHECKED_OUT;
  await booking.save();

  return sendSuccess(res, "Guest checked out", booking);
};

const cancel = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;

  const booking = await Booking.findById(id);
  if (!booking) {
    throw createHttpError(HTTP_STATUS.NOT_FOUND, "Booking not found!");
  }

  if (role !== USER_ROLES.ADMIN && !booking.user.equals(userId)) {
    throw createHttpError(
      HTTP_STATUS.FORBIDDEN,
      "You cannot cancel this booking",
    );
  }

  if (!canTransition(booking.status, BOOKING_STATUS.CANCELLED)) {
    throw createHttpError(
      HTTP_STATUS.CONFLICT,
      `Cannot cancel a booking that is ${booking.status}`,
    );
  }

  booking.status = BOOKING_STATUS.CANCELLED;
  await booking.save();

  return sendSuccess(res, "Booking cancelled", booking);
};

const listMyBookings = async (req: Request, res: Response) => {
  const { id: userId } = req.user;

  const bookings = await Booking.find({ user: userId })
    .populate("roomType", "name basePrice")
    .populate("room", "roomNumber floor")
    .sort({ createdAt: -1 });

  return sendSuccess(res, "Bookings fetched successfully", bookings);
};

const getBooking = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;

  const booking = await Booking.findById(id)
    .populate("roomType", "name basePrice capacity")
    .populate("room", "roomNumber floor");

  if (!booking) {
    throw createHttpError(HTTP_STATUS.NOT_FOUND, "Booking not found!");
  }

  if (role !== USER_ROLES.ADMIN && !booking.user.equals(userId)) {
    throw createHttpError(
      HTTP_STATUS.FORBIDDEN,
      "You cannot access this booking",
    );
  }

  return sendSuccess(res, "Booking fetched successfully", booking);
};

const listAllBookings = async (req: Request, res: Response) => {
  const { status } = req.query;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const bookings = await Booking.find(filter)
    .populate("roomType", "name basePrice")
    .populate("room", "roomNumber floor")
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  return sendSuccess(res, "Bookings fetched successfully", bookings);
};

const getAvailableRooms = async (req: Request, res: Response) => {
  const { id } = req.params;

  const booking = await Booking.findById(id);
  if (!booking) {
    throw createHttpError(HTTP_STATUS.NOT_FOUND, "Booking not found!");
  }

  if (!canTransition(booking.status, BOOKING_STATUS.CHECKED_IN)) {
    throw createHttpError(
      HTTP_STATUS.CONFLICT,
      `Cannot assign a room to a booking that is ${booking.status}`,
    );
  }

  const rooms = await Room.find({
    roomType: booking.roomType,
    deletedAt: null,
  }).select("roomNumber floor status");

  const occupied = await Booking.find({
    room: { $ne: null },
    status: { $in: [BOOKING_STATUS.CHECKED_IN] },
    checkIn: { $lt: booking.checkOut },
    checkOut: { $gt: booking.checkIn },
  }).select("room");

  const occupiedIds = new Set(occupied.map((b) => b.room!.toString()));

  const available = rooms.filter(
    (room) => !occupiedIds.has(room._id.toString()),
  );

  return sendSuccess(res, "Available rooms fetched successfully", available);
};
export {
  create,
  checkIn,
  checkOut,
  cancel,
  listMyBookings,
  getBooking,
  listAllBookings,
  getAvailableRooms,
};
