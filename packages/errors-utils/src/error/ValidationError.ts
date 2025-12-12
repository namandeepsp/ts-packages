import { HTTPError } from "./HTTPError";

export class ValidationError extends HTTPError {
    constructor(message = "Validation Error", details?: any) {
        super(message, 422, details);
    }
}
