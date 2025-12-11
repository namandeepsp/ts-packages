import crypto from "crypto";

/**
 * Sign message using HMAC SHA-256
 */
export const hmacSign = (message: string, secret: string): string => {
    return crypto.createHmac("sha256", secret).update(message).digest("hex");
};

/**
 * Verify HMAC signature
 */
export const hmacVerify = (
    message: string,
    secret: string,
    signature: string
): boolean => {

    const expected = hmacSign(message, secret);

    if (signature.length !== expected.length) return false;

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected)
    );
};
