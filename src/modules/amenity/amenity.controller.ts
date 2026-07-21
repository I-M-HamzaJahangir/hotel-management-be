import { Request, Response } from "express";
import { Amenity } from "./amenity.model";
import { HTTP_STATUS, IMAGES_FOLDER } from "../../constants/constant";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../utils/cloudinary.utils";
import { AmenityUpdate } from "../../types/type";
import createHttpError from "http-errors";
import { sendSuccess } from "../../utils/helper";

const createAmenity = async (req: Request, res: Response) => {
  const { name } = req.body;
  const file = req.file;

  const amenityExist = await Amenity.findOne({ name, deletedAt: null });
  if (amenityExist) {
    throw createHttpError(HTTP_STATUS.CONFLICT, "Amenity already exist");
  }
  let image = null;
  if (file) {
    image = await uploadToCloudinary(file.buffer, IMAGES_FOLDER.Amenities);
  }
  const newAmenity = await Amenity.create({
    name,
    ...(image && {
      icon: {
        url: image.secure_url,
        publicId: image.public_id,
      },
    }),
  });

  return sendSuccess(
    res,
    "Amenity created successfully",
    newAmenity,
    HTTP_STATUS.CREATED,
  );
};

const updateAmenity = async (req: Request, res: Response) => {
  const { id } = req.params;

  const { name, isActive } = req.body;

  const amenityExist = await Amenity.findOne({ _id: id, deletedAt: null });
  if (!amenityExist) {
    throw createHttpError(HTTP_STATUS.NOT_FOUND, "Amenity not found!");
  }

  const file = req.file;
  const update: AmenityUpdate = { name, isActive };

  if (file) {
    const image = await uploadToCloudinary(
      file.buffer,
      IMAGES_FOLDER.Amenities,
    );
    if (amenityExist.icon?.publicId) {
      deleteFromCloudinary(amenityExist.icon.publicId).catch((err) =>
        console.error("Failed to delete old icon:", err),
      );
    }

    update.icon = {
      url: image.secure_url,
      publicId: image.public_id,
    };
  }

  const updatedAmenity = await Amenity.findOneAndUpdate(
    { _id: id, deletedAt: null },
    update,
    {
      new: true,
      runValidators: true,
    },
  );

  return sendSuccess(res, "Amenity updated successfully", updatedAmenity);
};

// PUBLIC guests browsing and only active amenities
const getAmenities = async (_req: Request, res: Response) => {
  const amenities = await Amenity.find({ isActive: true, deletedAt: null });

  return sendSuccess(res, "Amenities fetched successfully", amenities);
};

// ADMIN everything including inactive
const getAllAmenities = async (_req: Request, res: Response) => {
  const amenities = await Amenity.find({ deletedAt: null });
  return sendSuccess(res, "Amenities fetched successfully", amenities);
};

const getAmenityById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const amenity = await Amenity.findOne({ _id: id, deletedAt: null });
  if (!amenity) {
    throw createHttpError(HTTP_STATUS.NOT_FOUND, "Amenity not found!");
  }

  return sendSuccess(res, "Amenity fetched successfully", amenity);
};

const deleteAmenity = async (req: Request, res: Response) => {
  const { id } = req.params;
  const amenity = await Amenity.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date() },
    { new: true },
  );
  if (!amenity) {
    throw createHttpError(HTTP_STATUS.NOT_FOUND, "Amenity not found!");
  }
  return sendSuccess(res, "Amenity deleted successfully");
};
export {
  createAmenity,
  updateAmenity,
  getAmenities,
  deleteAmenity,
  getAllAmenities,
  getAmenityById,
};
