import { Router } from "express";
import { signup, signin, singout, getMe } from "../controller/auth.controller";
import { validateRequest } from "../middleware/validate";
import { signinSchema, signupSchema } from "../validations/auth.validation";
import { checkAuth } from "../middleware/checkAuth";

const router = Router();

router.post("/signup", validateRequest(signupSchema), signup);
router.post("/signin", validateRequest(signinSchema), signin);
router.post("/signout", singout);
router.get("/me", checkAuth, getMe);

export default router;
