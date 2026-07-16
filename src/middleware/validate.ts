import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { HTTP_STATUS } from "../constants/constant";

const validateRequest = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validatedData = schema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Validation failed",
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
