import { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/constant";
import { User } from "../user/user.model";
import { JwtTokenPayload } from "../../types/type";
import {
  comparePassword,
  generateJWTToken,
  hashPassword,
} from "../../utils/helper";

const signup = async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;
  try {
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

      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Validation failed",
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

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "User created successfully",
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server Error",
    });
  }
};

const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const userExist = await User.findOne({ email }).select("+password");
    if (!userExist) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    const isValid = await comparePassword(password, userExist.password);
    if (!isValid) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Invalid credentials",
      });
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
      secure: false,
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000,
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server Error",
    });
  }
};

const signout = (_req: Request, res: Response) => {
  try {
    res.clearCookie(process.env.ACCESS_TOKEN_COOKIE_NAME!);
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Logout Successful",
    });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server Error",
    });
  }
};

export { signin, signout, signup };
