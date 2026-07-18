import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../constants/constant";
import createHttpError from "http-errors";

const authorize = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { role } = req.user;

    const isAllowed = allowedRoles.includes(role);

    if (!isAllowed) {
      throw createHttpError(
        HTTP_STATUS.FORBIDDEN,
        "You do not have permission to perform this action.",
      );
    }
    next();
  };
};

export { authorize };

