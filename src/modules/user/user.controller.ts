import { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/constant";
import { User } from "./user.model";

const getMe = async (req: Request, res: Response) => {
  const { id } = req.user;
  const user = await User.findById(id);
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: true,
      message: "User Not Found",
    });
  }

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: user,
  });
};

export { getMe };
