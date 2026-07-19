import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { HTTP_STATUS } from "../constants/constant";

const parseJsonFields = (...fields: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    for (const field of fields) {
      const value = req.body[field];
      if (typeof value === "string") {
        try {
          req.body[field] = JSON.parse(value);
        } catch {
          throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            `Invalid JSON in field: ${field}`,
          );
        }
      }
    }
    next();
  };
};

export { parseJsonFields };
