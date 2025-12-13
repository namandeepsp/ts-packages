import { JwtPayload } from "node_modules/@types/jsonwebtoken";

export interface TokenRequirements {
    requiredFields?: string[];
    forbiddenFields?: string[];
    validateTypes?: Record<string, "string" | "number" | "boolean">;
}

export function validateTokenPayload(
    payload: Record<string, unknown>,
    rules: TokenRequirements = {
        requiredFields: ["exp", "iat"]
    }
): { valid: true } | { valid: false; error: string } {
    const { requiredFields = [], forbiddenFields = [], validateTypes = {} } = rules;

    // 1. Required fields
    for (const field of requiredFields) {
        if (!(field in payload)) {
            return { valid: false, error: `Missing required field: ${field}` };
        }
    }

    // 2. Forbidden fields
    for (const field of forbiddenFields) {
        if (field in payload) {
            return { valid: false, error: `Forbidden field in token: ${field}` };
        }
    }

    // 3. Type validation
    for (const key in validateTypes) {
        const expectedType = validateTypes[key];
        if (key in payload && typeof payload[key] !== expectedType) {
            return {
                valid: false,
                error: `Invalid type for ${key}. Expected ${expectedType}.`
            };
        }
    }

    return { valid: true };
}

export function isTokenExpired(payload: JwtPayload): boolean {
    if (!payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
}

