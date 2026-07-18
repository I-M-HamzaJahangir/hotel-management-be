import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { HTTP_STATUS } from "../constants/constant";
const validateMongoID = (req: Request, _res: Response, next: NextFunction) => {
  const id = req.params.id as string;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Invalid Id");
  }
  next();
};

export { validateMongoID };
