import bcrypt from "bcryptjs";
import { VerificationError } from "src/error";

/**
 * Compare a password with a stored hash asynchronously.
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    try {
        const result = await bcrypt.compare(password, hash);
        if (!result) throw new VerificationError();
        return result;
    } catch {
        throw new VerificationError();
    }
};


export async function verifyPasswordWithPepper(password: string, pepper: string, hash: string) {
    return verifyPassword(password + pepper, hash);
}

/**
 * Compare a password with a stored hash synchronously.
 */
export const verifyPasswordSync = (password: string, hash: string): boolean => {
    try {
        const result = bcrypt.compareSync(password, hash);
        if (!result) throw new VerificationError();
        return result;
    } catch (error) {
        throw new VerificationError();
    }
};

export async function verifyPasswordWithPepperSync(password: string, pepper: string, hash: string) {
    return verifyPasswordSync(password + pepper, hash);
}