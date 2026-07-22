import { Router } from "express";
import { validateMongoID } from "../../middleware/validateMongoID";
import { validateRequest } from "../../middleware/validate";
import { checkInSchema } from "./booking.validation";
import { checkIn, checkOut, getAvailableRooms, listAllBookings } from "./booking.controller";

const router = Router();
router.get("/", listAllBookings);
router.patch(
  "/:id/check-in",
  validateMongoID,
  validateRequest(checkInSchema),
  checkIn,
);
router.patch("/:id/check-out", validateMongoID, checkOut);
router.get("/:id/available-rooms", validateMongoID, getAvailableRooms);

export default router;
