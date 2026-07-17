import { Router } from "express";
import { validateRequest } from "../../middleware/validate";
import { createAmenitySchema, updateAmenitySchema } from "./amenity.validation";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { USER_ROLES } from "../../constants/role";
import { createAmenity, updateAmenity } from "./amenity.controller";
import { createMulterUploader } from "../../middleware/multer";
import { validateMongoID } from "../../middleware/validateMongoID";

const router = Router();

const amenityIconUploader = createMulterUploader({
  maxFileSize: 1 * 1024 * 1024,
});

router.post(
  "/",
  authenticate,
  authorize(USER_ROLES.ADMIN),
  amenityIconUploader.single("icon"),
  validateRequest(createAmenitySchema),
  createAmenity,
);
router.put(
  "/:id",
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validateMongoID,
  amenityIconUploader.single("icon"),
  validateRequest(updateAmenitySchema),
  updateAmenity,
);
export { router };
