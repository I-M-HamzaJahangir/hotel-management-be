import { Router } from "express";

import { getAmenities } from "./amenity.controller";

const router = Router();

router.get("/", getAmenities);

export default router;
