import { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/constant";
import { User } from "../user/user.model";
import { JwtTokenPayload } from "../../types/type";
import {
  comparePassword,
  generateJWTToken,
  hashPassword,
  sendSuccess,
} from "../../utils/helper";
import createHttpError from "http-errors";

const signup = async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;

  const userExist = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (userExist) {
    const errors = [];

    if (userExist.email === email) {
      errors.push({ field: "email", message: "Email already exists" });
    }
    if (userExist.phone === phone) {
      errors.push({ field: "phone", message: "Phone number already exists" });
    }
    throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Validation failed", {
      errors,
    });
  }

  const securePassword = await hashPassword(password);
  const newUser = await User.create({
    name,
    email,
    phone,
    password: securePassword,
    lastLoginAt: null,
  });

  return sendSuccess(
    res,
    "User created successfully",
    {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
    },
    HTTP_STATUS.CREATED,
  );
};

const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const userExist = await User.findOne({ email }).select("+password");
  if (!userExist) {
    throw createHttpError(HTTP_STATUS.UNAUTHORIZED, "Invalid credentials");
  }

  const isValid = await comparePassword(password, userExist.password);
  if (!isValid) {
    throw createHttpError(HTTP_STATUS.UNAUTHORIZED, "Invalid credentials");
  }

  const tokenPayload: JwtTokenPayload = {
    id: userExist._id.toString(),
    email: userExist.email,
    name: userExist.name,
    role: userExist.role,
  };
  const token = generateJWTToken(tokenPayload);

  res.cookie(process.env.ACCESS_TOKEN_COOKIE_NAME!, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 8 * 60 * 60 * 1000,
    path: "/",
  });

  return sendSuccess(res, "Login successful");
};

const signout = (_req: Request, res: Response) => {
  res.clearCookie(process.env.ACCESS_TOKEN_COOKIE_NAME!, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return sendSuccess(res, "Logout Successful");
};

export { signin, signout, signup };
