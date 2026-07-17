import * as z from "zod";

const createAmenitySchema = z.object({
  name: z.string().trim().toLowerCase().min(2),
});

const updateAmenitySchema = z.object({
  name: z.string().trim().toLowerCase().min(2),
  isActive: z.boolean(),
});

export { createAmenitySchema, updateAmenitySchema };
