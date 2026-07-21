import { Router } from "express";
import { validateRequest } from "../../middleware/validate";
import { createAmenitySchema, updateAmenitySchema } from "./amenity.validation";
import {
  createAmenity,
  deleteAmenity,
  getAllAmenities,
  getAmenityById,
  updateAmenity,
} from "./amenity.controller";
import { createMulterUploader } from "../../middleware/multer";
import { validateMongoID } from "../../middleware/validateMongoID";

const router = Router();

const amenityIconUploader = createMulterUploader({
  maxFileSize: 1 * 1024 * 1024,
});

router.get("/", getAllAmenities);
router.get("/:id", validateMongoID, getAmenityById);

router.post(
  "/",
  amenityIconUploader.single("icon"),
  validateRequest(createAmenitySchema),
  createAmenity,
);
router.put(
  "/:id",
  validateMongoID,
  amenityIconUploader.single("icon"),
  validateRequest(updateAmenitySchema),
  updateAmenity,
);

router.delete("/:id", validateMongoID, deleteAmenity);

export default router;
