import { startOfToday } from "date-fns";
import * as z from "zod";

const createBookingSchema = z
  .object({
    roomType: z.string().regex(/^[a-f\d]{24}$/i, "Invalid room type id"),
    guestCount: z.int().min(1),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
  })
  .refine((d) => d.checkOut > d.checkIn, {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  })
  .refine((d) => d.checkIn >= startOfToday(), {
    message: "Check-in cannot be in the past",
    path: ["checkIn"],
  });

const checkInSchema = z.object({
  room: z.string().regex(/^[a-f\d]{24}$/i, "Invalid room id"),
});

export { createBookingSchema, checkInSchema };
