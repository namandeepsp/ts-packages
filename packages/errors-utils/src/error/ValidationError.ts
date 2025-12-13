import { HTTPError } from "./HTTPError";

export class ValidationError extends HTTPError {
    constructor(message = "Validation Error", details?: unknown) {
        super(message, 422, details);
    }
}
