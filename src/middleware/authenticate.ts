import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../constants/constant";
import { verifyJWTToken } from "../utils/helper";
import createHttpError from "http-errors";

const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = req.cookies[process.env.ACCESS_TOKEN_COOKIE_NAME!];
  if (!token) {
    throw createHttpError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
  }

  let decodedToken;

  try {
    decodedToken = verifyJWTToken(token);
  } catch {
    throw createHttpError(HTTP_STATUS.UNAUTHORIZED, "Invalid or expired token");
  }

  req.user = decodedToken;
  next();
};

export { authenticate };
