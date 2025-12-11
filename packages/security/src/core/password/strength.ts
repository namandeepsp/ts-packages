import { InvalidPasswordError, WeakPasswordError } from "src/error";
import { PasswordStrengthOptions } from "./types";

export const isPasswordStrong = (
    password: string,
    options: PasswordStrengthOptions = {}
): boolean => {
    if (!password) throw new InvalidPasswordError();

    const {
        minLength = 8,
        requireUppercase = true,
        requireLowercase = true,
        requireNumbers = true,
        requireSymbols = false,
    } = options;

    if (password.length < minLength) throw new WeakPasswordError("Password is too short.");
    if (requireUppercase && !/[A-Z]/.test(password)) throw new WeakPasswordError("Must include uppercase.");
    if (requireLowercase && !/[a-z]/.test(password)) throw new WeakPasswordError("Must include lowercase.");
    if (requireNumbers && !/[0-9]/.test(password)) throw new WeakPasswordError("Must include numbers.");
    if (requireSymbols && !/[^A-Za-z0-9]/.test(password)) throw new WeakPasswordError("Must include symbols.");

    return true;
};
