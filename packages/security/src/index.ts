import jwt, { Secret } from "jsonwebtoken";
import bcrypt from "bcryptjs";

// 🧱 Password helpers
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// 🧩 JWT helpers
export const signToken = (payload: object, secret: Secret, expiresIn = "1h"): string => {
  return jwt.sign(payload, secret, { expiresIn, algorithm: "HS256" } as jwt.SignOptions);
};

export const verifyToken = (token: string, secret: Secret): object | string => {
  return jwt.verify(token, secret);
};
