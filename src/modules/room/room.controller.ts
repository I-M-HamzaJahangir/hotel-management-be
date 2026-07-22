import { Request, Response } from "express";
import { Room } from "./room.model";
import createHttpError from "http-errors";
import { HTTP_STATUS } from "../../constants/constant";
import { RoomType } from "../room-type/roomType.model";
import { sendSuccess } from "../../utils/helper";

const createRoom = async (req: Request, res: Response) => {
  const { roomNumber, floor, roomType } = req.body;

  const roomAlreadyExist = await Room.exists({ roomNumber, deletedAt: null });
  if (roomAlreadyExist) {
    throw createHttpError(
      HTTP_STATUS.CONFLICT,
      `Room ${roomNumber} already exists`,
    );
  }
  const roomTypeExist = await RoomType.exists({
    _id: roomType,
    isActive: true,
  });
  if (!roomTypeExist) {
    throw createHttpError(
      HTTP_STATUS.BAD_REQUEST,
      "Room Types Does not exist ",
    );
  }

  const newRoom = await Room.create({
    roomNumber,
    floor,
    roomType,
  });

  return sendSuccess(res, "Room Created Successfuly", newRoom);
};
const updateRoom = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { floor, status, roomType } = req.body;
  const roomExist = await Room.exists({ _id: id, deletedAt: null });
  if (!roomExist) {
    throw createHttpError(HTTP_STATUS.NOT_FOUND, "Room not found!");
  }

  const roomTypeExist = await RoomType.exists({
    _id: roomType,
    isActive: true,
  });
  if (!roomTypeExist) {
    throw createHttpError(
      HTTP_STATUS.BAD_REQUEST,
      "Room Types Does not exist ",
    );
  }

  const update = { floor, status, roomType };
  const updatedRoom = await Room.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });

  return sendSuccess(res, "Room Updated Successfully", updatedRoom);
};

const getRooms = async (_req: Request, res: Response) => {
  const rooms = await Room.find({ deletedAt: null }).populate({
    path: "roomType",
    select: "name basePrice capacity images beds",
  });
  return sendSuccess(res, "Room fetched succcessfully", rooms);
};

const getRoom = async (req: Request, res: Response) => {
  const { id } = req.params;

  const room = await Room.findOne({ _id: id, deletedAt: null }).populate({
    path: "roomType",
    select: "name basePrice capacity images beds",
  });
  if (!room) {
    throw createHttpError(HTTP_STATUS.NOT_FOUND, "Room not found!");
  }
  return sendSuccess(res, "Rome fetched successfully", room);
};

const deleteRoom = async (req: Request, res: Response) => {
  const { id } = req.params;

  const room = await Room.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date() },
    {
      new: true,
    },
  );
  if (!room) {
    throw createHttpError(HTTP_STATUS.NOT_FOUND, "Room not found!");
  }

  return sendSuccess(res, "Room Deleted sucessfully", room);
};

export { createRoom, updateRoom, getRooms, getRoom, deleteRoom };
