import { JwtPayload, Secret, verify } from "jsonwebtoken";
import { signToken } from "./signToken";
import { verifyToken } from "./verify";

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export const generateTokens = (
    payload: object,
    accessSecret: Secret,
    refreshSecret: Secret,
    accessExpiry: string | number = "15m",
    refreshExpiry: string | number = "7d"
): TokenPair => {
    return {
        accessToken: signToken(payload, accessSecret, accessExpiry, { algorithm: "HS256" }),
        refreshToken: signToken(payload, refreshSecret, refreshExpiry, { algorithm: "HS256" }),
    };
};

export function rotateRefreshToken(
    oldToken: string,
    secret: Secret
): string {
    const decoded = verifyToken(oldToken, secret);

    if (typeof decoded === "string") {
        throw new Error("Invalid token payload — expected JWT payload object");
    }

    const payload: JwtPayload = { ...decoded };

    delete payload.iat;
    delete payload.exp;

    return signToken(payload, secret, "7d");
}

