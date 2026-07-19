import { Request, Response } from "express";
import { RoomType } from "./roomType.model";
import createHttpError from "http-errors";
import { HTTP_STATUS, IMAGES_FOLDER } from "../../constants/constant";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../utils/cloudinary.utils";
import { sendSuccess } from "../../utils/helper";
import { RoomTypeUpdate } from "../../types/type";
import { Amenity } from "../amenity/amenity.model";
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
};
