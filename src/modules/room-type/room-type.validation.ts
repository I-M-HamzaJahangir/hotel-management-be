import * as z from "zod";
import { BED_TYPES } from "../../constants/constant";

const createRoomTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Name must at least be 3 characters long!"),
  description: z.string().trim().min(20).max(2000),
  basePrice: z.coerce.number().int().positive(),
  capacity: z.coerce.number().int().min(1),
  beds: z
    .array(
      z.object({
        type: z.enum(BED_TYPES),
        quantity: z.int().min(1),
      }),
    )
    .min(1, "At least one bed is required"),
  amenities: z.array(z.string().regex(/^[a-f\d]{24}$/i)).optional(),
});

const updateRoomTypeSchema = createRoomTypeSchema.extend({
  isActive: z.stringbool(),
  amenities: z.array(z.string().regex(/^[a-f\d]{24}$/i)).optional(),
});
export { createRoomTypeSchema, updateRoomTypeSchema };
