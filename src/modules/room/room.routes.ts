import { Router } from "express";
import { validateRequest } from "../../middleware/validate";
import { validateMongoID } from "../../middleware/validateMongoID";
import {
  createRoom,
  deleteRoom,
  getRoom,
  getRooms,
  updateRoom,
} from "./room.controller";
import { createRoomSchema, updateRoomSchema } from "./room.validation";

const router = Router();

router.post("/", validateRequest(createRoomSchema), createRoom);
router.put(
  "/:id",
  validateMongoID,
  validateRequest(updateRoomSchema),
  updateRoom,
);
router.get("/", getRooms);
router.get("/:id", validateMongoID, getRoom);
router.delete("/:id", validateMongoID, deleteRoom);

export default router;
