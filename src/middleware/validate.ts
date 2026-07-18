import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { HTTP_STATUS } from "../constants/constant";
import createHttpError from "http-errors";

const validateRequest = (schema: ZodType) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const validatedData = schema.safeParse(req.body);
    if (!validatedData.success) {
      throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Validation failed", {
        errors: validatedData.error.issues.map((issue) => ({
          field: issue.path[0],
          message: issue.message,
        })),
      });
    }
    req.body = validatedData.data;
    next();
  };
};

export { validateRequest };
