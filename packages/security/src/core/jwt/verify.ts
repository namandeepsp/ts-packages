import jwt, { Secret, JwtPayload, verify } from "jsonwebtoken";

/**
 * Verify token (throws if invalid or expired)
 */
export const verifyToken = (
    token: string,
    secret: Secret
): string | JwtPayload => {
    return verify(token, secret);
};

/**
 * Safe verify — never throws, returns { valid, payload?, error? }
 */
export const safeVerifyToken = (
    token: string,
    secret: Secret
): {
    valid: boolean;
    payload?: string | JwtPayload;
    error?: unknown;
} => {
    try {
        const decoded = verify(token, secret);
        return { valid: true, payload: decoded };
    } catch (error) {
        return { valid: false, error };
    }
};
