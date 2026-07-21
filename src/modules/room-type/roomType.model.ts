import mongoose from "mongoose";
import { BED_TYPES } from "../../constants/constant";

const roomTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    beds: [
      {
        type: {
          type: String,
          enum: BED_TYPES,
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    images: {
      type: [
        {
          url: { type: String, required: true, trim: true },
          publicId: { type: String, required: true, trim: true },
        },
      ],
      validate: {
        validator: (arr: unknown[]) => arr.length > 0,
        message: "At least one image is required",
      },
    },
    amenities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Amenity",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const RoomType = mongoose.model("RoomType", roomTypeSchema);

export { RoomType };
