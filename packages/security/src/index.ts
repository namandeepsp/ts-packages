import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";

// 🧱 Password helpers
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// For backward compatibility
export const comparePassword = verifyPassword;

// 🧩 JWT helpers
export const generateToken = (payload: Record<string, unknown>, secret: Secret, expiresIn = "1h"): string => {
  return jwt.sign(payload, secret, { expiresIn, algorithm: "HS256" } as jwt.SignOptions);
};

export const verifyToken = (token: string, secret: Secret): string | JwtPayload => {
  return jwt.verify(token, secret);
};

// For backward compatibility
export const signToken = generateToken;

// Default export for namespace usage
const SecurityUtils = {
  hashPassword,
  verifyPassword,
  comparePassword,
  generateToken,
  verifyToken,
  signToken
};

export default SecurityUtils;
