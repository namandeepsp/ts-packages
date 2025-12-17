export interface PasswordConfig {
    saltRounds?: number;
    minLength?: number;
    maxLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
    customRules?: PasswordRule[];
}

export interface PasswordRule {
    test: (password: string) => boolean;
    message: string;
}

export interface PasswordStrength {
    score: number; // 0-4 (very weak to very strong)
    label: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
    feedback: string[];
    suggestions: string[];
}

export interface PasswordValidationResult {
    isValid: boolean;
    errors: string[];
    strength: PasswordStrength;
}

export interface HashedPassword {
    hash: string;
    salt: string;
}

export interface IPasswordManager {
    hash(password: string, salt?: string): Promise<HashedPassword>;
    verify(password: string, hash: string, salt: string): Promise<boolean>;
    generate(length?: number, options?: PasswordConfig): string;
    validate(password: string, config?: PasswordConfig): PasswordValidationResult;
    checkStrength(password: string): PasswordStrength;
    needsUpgrade(hash: string, currentConfig: PasswordConfig): boolean;
}

export interface IPasswordStrengthChecker {
    analyze(password: string): PasswordStrength;
    checkLength(password: string): { valid: boolean; message: string };
    checkComplexity(password: string, config: PasswordConfig): { valid: boolean; message: string }[];
    checkCommonPasswords(password: string): { valid: boolean; message: string };
    checkSequential(password: string): { valid: boolean; message: string };
    checkRepetition(password: string): { valid: boolean; message: string };
}

