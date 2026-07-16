import bcrypt from "bcrypt";
import { JwtTokenPayload } from "../types/type";
import jwt from "jsonwebtoken";

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

export { hashPassword, comparePassword, generateJWTToken, verifyJWTToken };
