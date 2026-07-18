import { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/constant";
import { User } from "./user.model";
import createHttpError from "http-errors";
import { sendSuccess } from "../../utils/helper";

const getMe = async (req: Request, res: Response) => {
  const { id } = req.user;
  const user = await User.findById(id);
  if (!user) {
    throw createHttpError(HTTP_STATUS.NOT_FOUND, "User Not Found");
  }

  return sendSuccess(res, "User fetched successfully", user);
};

export { getMe };
