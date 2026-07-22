import mongoose from "mongoose";
import { BOOKING_STATUS } from "../../constants/constant";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },
    roomType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomType",
      required: true,
    },
    guestCount: { type: Number, required: true, min: 1 },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.CONFIRMED,
    },
    snapshot: {
      type: {
        roomTypeName: { type: String, required: true },
        pricePerNight: { type: Number, required: true },
        nights: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        roomNumber: { type: Number, default: null },
      },
      required: true,
    },
  },
  { timestamps: true },
);

const Booking = mongoose.model("Booking", bookingSchema);

export { Booking };
