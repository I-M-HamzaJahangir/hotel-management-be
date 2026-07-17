import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
const validateMongoID = (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      msg: "Invalid Id",
    });
  }
  next();
};

export { validateMongoID };
