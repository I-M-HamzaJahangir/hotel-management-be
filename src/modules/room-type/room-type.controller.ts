import { Request, Response } from "express";
import { RoomType } from "./roomType.model";
import createHttpError from "http-errors";
import { BOOKING_STATUS, HTTP_STATUS, IMAGES_FOLDER } from "../../constants/constant";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../utils/cloudinary.utils";
import { sendSuccess } from "../../utils/helper";
import { RoomTypeUpdate } from "../../types/type";
import { Amenity } from "../amenity/amenity.model";
import { normalizeDate } from "../../utils/date.utils";
import { Room } from "../room/room.model";
import { Booking } from "../booking/booking.model";
import { differenceInCalendarDays } from "date-fns";
import { availabilityQuerySchema } from "./room-type.validation";
const createRoomType = async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    throw createHttpError(
      HTTP_STATUS.BAD_REQUEST,
      "At least one image is required",
    );
  }

  const { name, description, basePrice, capacity, beds, amenities } = req.body;

  const roomTypeExist = await RoomType.findOne({ name });
  if (roomTypeExist) {
    throw createHttpError(HTTP_STATUS.CONFLICT, "Room type already exist!");
  }
  if (amenities && amenities.length > 0) {
    const count = await Amenity.countDocuments({
      _id: { $in: amenities },
      deletedAt: null,
    });
    if (count !== amenities.length) {
      throw createHttpError(
        HTTP_STATUS.BAD_REQUEST,
        "One or more amenities are invalid",
      );
    }
  }

  const uploaded = await Promise.all(
    files.map((file) =>
      uploadToCloudinary(file.buffer, IMAGES_FOLDER.RoomTypes),
    ),
  );
  const images = uploaded.map((img) => ({
    url: img.secure_url,
    publicId: img.public_id,
  }));

  const newRoomType = await RoomType.create({
    name,
    description,
    basePrice,
    capacity,
    beds,
    images,
    amenities,
  });

  return sendSuccess(
    res,
    "Room type created Successfully",
    newRoomType,
    HTTP_STATUS.CREATED,
  );
};

const updateRoomType = async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const { id } = req.params;

  const roomTypeExist = await RoomType.findById(id);
  if (!roomTypeExist) {
    throw createHttpError(HTTP_STATUS.NOT_FOUND, "Room type not found!");
  }

  const { name, description, basePrice, capacity, beds, isActive, amenities } =
    req.body;
  if (amenities && amenities.length > 0) {
    const count = await Amenity.countDocuments({
      _id: { $in: amenities },
      deletedAt: null,
    });
    if (count !== amenities.length) {
      throw createHttpError(
        HTTP_STATUS.BAD_REQUEST,
        "One or more amenities are invalid",
      );
    }
  }
  const update: RoomTypeUpdate = {
    name,
    description,
    basePrice,
    capacity,
    beds,
    isActive,
    amenities,
  };

  if (files && files.length > 0) {
    const uploaded = await Promise.all(
      files.map((f) => uploadToCloudinary(f.buffer, IMAGES_FOLDER.RoomTypes)),
    );
    update.images = uploaded.map((img) => ({
      url: img.secure_url,
      publicId: img.public_id,
    }));
  }

  const updatedRoomType = await RoomType.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });

  if (update.images) {
    roomTypeExist.images.forEach((image) =>
      deleteFromCloudinary(image.publicId).catch((err) =>
        console.error("Failed to delete old image:", err),
      ),
    );
  }

  return sendSuccess(res, "Room type updated successfully", updatedRoomType);
};

const deleteRoomType = async (req: Request, res: Response) => {
  const { id } = req.params;

  // TODO(rooms module): block deletion when rooms reference this type —

  const roomType = await RoomType.findByIdAndDelete(id);
  if (!roomType) {
    throw createHttpError(HTTP_STATUS.NOT_FOUND, "Room type not found!");
  }
  roomType.images.forEach((img) =>
    deleteFromCloudinary(img.publicId).catch((err) =>
      console.error("Error during image deletion:", err),
    ),
  );
  return sendSuccess(res, "Room type deleted successfully");
};

// PUBLIC — guests browsing: active types only
const getRoomTypes = async (_req: Request, res: Response) => {
  const roomTypes = await RoomType.find({ isActive: true }).populate({
    path: "amenities",
    match: { deletedAt: null, isActive: true },
    select: "name icon",
  });
  return sendSuccess(res, "Room types fetched successfully", roomTypes);
};
const checkAvailability = async (req: Request, res: Response) => {
  const { checkIn, checkOut, guests } = availabilityQuerySchema.parse(req.query);

  const checkInDate = normalizeDate(checkIn);
  const checkOutDate = normalizeDate(checkOut);

  const types = await RoomType.find({ isActive: true, capacity: { $gte: Number(guests) } });

  const results = await Promise.all(
    types.map(async (type) => {
      const totalRooms = await Room.countDocuments({ roomType: type._id, deletedAt: null });
      const booked = await Booking.countDocuments({
        roomType: type._id,
        status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CHECKED_IN] },
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
      });
      const available = totalRooms - booked;
      const nights = differenceInCalendarDays(checkOutDate, checkInDate);
      return {
        roomType: type,
        available,
        nights,
        totalPrice: type.basePrice * nights,
      };
    }),
  );

  return sendSuccess(res, "Availability fetched", results.filter((r) => r.available > 0));
};
// ADMIN — everything, including inactive
const getAllRoomTypes = async (_req: Request, res: Response) => {
  const roomTypes = await RoomType.find({}).populate({
    path: "amenities",
    match: { deletedAt: null },
    select: "name icon isActive",
  });
  return sendSuccess(res, "Room types fetched successfully", roomTypes);
};
const getRoomTypeById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const roomType = await RoomType.findById(id).populate({
    path: "amenities",
    match: { deletedAt: null },
    select: "name icon isActive",
  });
  if (!roomType) {
    throw createHttpError(HTTP_STATUS.NOT_FOUND, "Room type not found!");
  }

  return sendSuccess(res, "Room type fetched successfully", roomType);
};

export {
  createRoomType,
  updateRoomType,
  deleteRoomType,
  getRoomTypes,
  getAllRoomTypes,
  getRoomTypeById,
  checkAvailability
};
