import { ErrorRequestHandler } from "express";
import { isHttpError } from "http-errors";
import { HTTP_STATUS } from "../constants/constant";

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (isHttpError(error)) {
    return res.status(error.status).json({
      success: false,
      message: error.message,
      ...(error.errors && { error: error.errors }),
    });
  }
  console.error(error);

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Server Error",
  });
};

export { errorHandler };
