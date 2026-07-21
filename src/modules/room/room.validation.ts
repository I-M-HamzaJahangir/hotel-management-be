import * as z from "zod";
import { ROOM_STATUS } from "../../constants/constant";

const createRoomSchema = z.object({
  roomNumber: z.int().min(1),
  floor: z.int().min(1).max(20),
  roomType: z.string().regex(/^[a-f\d]{24}$/i, "Invalid room type id"),
});

const updateRoomSchema = z.object({
  roomNumber: z.int().min(1),
  floor: z.int().min(1).max(20),
  roomType: z.string().regex(/^[a-f\d]{24}$/i, "Invalid room type id"),
  status: z.enum(Object.values(ROOM_STATUS)),
});

export { createRoomSchema, updateRoomSchema };
