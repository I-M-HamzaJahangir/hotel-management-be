import mongoose from "mongoose";
import { ROOM_STATUS } from "../../constants/constant";

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: Number,
      required: true,
    },
    floor: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ROOM_STATUS),
      default: ROOM_STATUS.AVAILABLE,
    },
    roomType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomType",
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

roomSchema.index(
  { roomNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null },
  },
);

const Room = mongoose.model("Room", roomSchema);

export { Room };
