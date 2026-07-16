import { Router } from "express";
import { validateRequest } from "../../middleware/validate";
import { signin, signout, signup } from "./auth.controller";
import { signinSchema, signupSchema } from "./auth.validation";

const router = Router();

router.post("/signup", validateRequest(signupSchema), signup);
router.post("/signin", validateRequest(signinSchema), signin);
router.post("/signout", signout);

export default router;
