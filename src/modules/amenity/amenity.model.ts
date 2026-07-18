import mongoose from "mongoose";

const amenitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    icon: {
      url: {
        type: String,
        trim: true,
      },
      publicId: {
        type: String,
        trim: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedAt: { type: Date, default: null, index: true },
  },
  {
    timestamps: true,
  },
);
amenitySchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);

const Amenity = mongoose.model("Amenity", amenitySchema);

export { Amenity };
