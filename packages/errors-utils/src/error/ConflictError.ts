import { HTTPError } from "./HTTPError";

export class ConflictError extends HTTPError {
    constructor(message = "Conflict", details?: any) {
        super(message, 409, details);
    }
}
