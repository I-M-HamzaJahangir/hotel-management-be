import { Router } from "express";

import { createMulterUploader } from "../../middleware/multer";
import { validateRequest } from "../../middleware/validate";
import {
  createRoomTypeSchema,
  updateRoomTypeSchema,
} from "./room-type.validation";
import {
  createRoomType,
  deleteRoomType,
  getAllRoomTypes,
  getRoomTypeById,
  updateRoomType,
} from "./room-type.controller";
import { parseJsonFields } from "../../middleware/parseJsonFields";
import { validateMongoID } from "../../middleware/validateMongoID";

const router = Router();

const uploader = createMulterUploader({
  maxFileSize: 5 * 1024 * 1024,
});

router.get("/", getAllRoomTypes);
router.get("/:id", validateMongoID, getRoomTypeById);

router.post(
  "/",
  uploader.array("images", 8),
  parseJsonFields("beds"),
  validateRequest(createRoomTypeSchema),
  createRoomType,
);
router.put(
  "/:id",
  validateMongoID,
  uploader.array("images", 8),
  parseJsonFields("beds"),
  validateRequest(updateRoomTypeSchema),
  updateRoomType,
);
router.delete("/:id", validateMongoID, deleteRoomType);

export default router;
