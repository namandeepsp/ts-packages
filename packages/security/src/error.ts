export class SecurityError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class InvalidPasswordError extends SecurityError {
    constructor() {
        super("Password must be a non-empty string.");
    }
}

export class WeakPasswordError extends SecurityError {
    constructor(reason?: string) {
        super(reason || "Password does not meet required strength criteria.");
    }
}

export class HashingError extends SecurityError {
    constructor(message = "Failed to hash password.") {
        super(message);
    }
}

export class VerificationError extends SecurityError {
    constructor(message = "Password verification failed.") {
        super(message);
    }
}
