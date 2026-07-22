import bcrypt from "bcrypt";
import { JwtTokenPayload } from "../types/type";
import jwt from "jsonwebtoken";
import { BOOKING_TRANSITIONS, HTTP_STATUS } from "../constants/constant";
import { Response } from "express";

const hashPassword = async (password: string) => {
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

const comparePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateJWTToken = (payload: JwtTokenPayload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "8h" });
  return token;
};

const verifyJWTToken = (token: string): JwtTokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtTokenPayload;
};

const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  status: number = HTTP_STATUS.OK,
) => {
  return res.status(status).json({
    success: true,
    message,
    ...(data !== undefined && { data }),
  });
};

const canTransition = (from: string, to: string) =>
  BOOKING_TRANSITIONS[from]?.includes(to) ?? false;

export {
  hashPassword,
  comparePassword,
  generateJWTToken,
  verifyJWTToken,
  sendSuccess,
  canTransition,
};
