import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../constants/constant";
import { verifyJWTToken } from "../utils/helper";

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies[process.env.ACCESS_TOKEN_COOKIE_NAME!];
    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const decodedToken = verifyJWTToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export { authenticate };
