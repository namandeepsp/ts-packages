import crypto from "crypto";

/**
 * Generate cryptographically secure random string
 */
export const randomToken = (length = 32): string => {
    return crypto.randomBytes(length).toString("hex");
};

/**
 * Generate a strong random password
 */
export const generateStrongPassword = (length = 16): string => {
    return crypto.randomBytes(length).toString("hex").slice(0, length);
};
