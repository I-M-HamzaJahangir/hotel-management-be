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

  const amenityExist = await Amenity.findOne({ name });
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

  const amenityExist = await Amenity.findById(id);
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

  const updatedAmenity = await Amenity.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });

  return sendSuccess(res, "Amenity updated successfully", updatedAmenity);
};

export { createAmenity, updateAmenity };
