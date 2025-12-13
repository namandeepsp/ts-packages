import jwt, { Secret, sign, SignOptions } from "jsonwebtoken";
import { parseDuration } from "./parseDuration";

function getExpiryTimestamp(seconds: number) {
    return Math.floor(Date.now() / 1000) + seconds;
}

export const signToken = (
    payload: Record<string, unknown>,
    secret: Secret,
    expiresIn: string | number = "1h",
    options: SignOptions = {}
): string => {
    const seconds = parseDuration(expiresIn);

    if (!seconds || seconds < 10) {
        throw new Error("Token expiry too small");
    }

    const tokenPayload = {
        ...payload
    };

    if (!("exp" in payload)) tokenPayload.exp = getExpiryTimestamp(seconds);
    if (!("iat" in payload)) tokenPayload.iat = Math.floor(Date.now() / 1000);

    return sign(tokenPayload, secret, {
        algorithm: "HS256",
        ...options
    });
};
