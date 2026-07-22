import { Router } from "express";
import { validateMongoID } from "../../middleware/validateMongoID";
import { validateRequest } from "../../middleware/validate";
import {  createBookingSchema } from "./booking.validation";
import { cancel, create, getBooking, listMyBookings } from "./booking.controller";

const router = Router();
router.post("/", validateRequest(createBookingSchema), create);
router.get("/", listMyBookings);
router.get("/:id", validateMongoID, getBooking);
router.patch("/:id/cancel", validateMongoID, cancel);
export default router;
