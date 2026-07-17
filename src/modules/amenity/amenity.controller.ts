import { Request, Response } from "express";
import { Amenity } from "./amenity.model";
import { HTTP_STATUS, IMAGES_FOLDER } from "../../constants/constant";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../utils/cloudinary.utils";
import { AmenityUpdate } from "../../types/type";

const createAmenity = async (req: Request, res: Response) => {
  const { name } = req.body;
  const file = req.file;

  try {
    const amenityExist = await Amenity.findOne({ name });
    if (amenityExist) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: "Amenity already exist",
      });
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

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Amenity created successfully",
      data: newAmenity,
    });
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server Error",
    });
  }
};

const updateAmenity = async (req: Request, res: Response) => {
  const { id } = req.params;

  const { name, isActive } = req.body;

  try {
    const amenityExist = await Amenity.findById(id);
    if (!amenityExist) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Amenity not found!",
      });
    }

    const file = req.file;
    const update: AmenityUpdate = { name, isActive };

    if (file) {
      const image = await uploadToCloudinary(
        file.buffer,
        IMAGES_FOLDER.Amenities,
      );
      if (amenityExist.icon?.publicId) {
        await deleteFromCloudinary(amenityExist.icon.publicId);
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
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Amenity updated successfully",
      data: updatedAmenity,
    });
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server Error",
    });
  }
};

export { createAmenity, updateAmenity };
