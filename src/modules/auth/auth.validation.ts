import { isValidPhoneNumber } from "libphonenumber-js";
import * as z from "zod";

const signupSchema = z.object({
  name: z.string().trim().min(2),
  email: z.email().trim().toLowerCase(),
  phone: z
    .string()
    .trim()
    .refine((value) => isValidPhoneNumber(value), {
      message: "Invalid phone number",
    }),
  password: z.string().min(8),
});

const signinSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8),
});

export { signinSchema, signupSchema };
