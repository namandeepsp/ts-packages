import crypto from "crypto";

const ALGO = "AES-256-GCM";

export const encrypt = (text: string, secret: string): string => {
    const key = crypto.createHash("sha256").update(secret).digest();
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(ALGO, key, iv);

    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);

    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};
