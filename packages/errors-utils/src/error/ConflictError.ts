import { HTTPError } from "./HTTPError";

export class ConflictError extends HTTPError {
    constructor(message = "Conflict", details?: unknown) {
        super(message, 409, details);
    }
}
