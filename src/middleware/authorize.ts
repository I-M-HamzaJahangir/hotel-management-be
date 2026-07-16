import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../constants/constant";

const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.user;

    const isAllowed = allowedRoles.includes(role);

    if (!isAllowed) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }
    next();
  };
};

export { authorize };
