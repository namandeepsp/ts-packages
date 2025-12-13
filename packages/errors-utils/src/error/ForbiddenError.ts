import { HTTPError } from "./HTTPError";

export class ForbiddenError extends HTTPError {
    constructor(message = "Forbidden", details?: unknown) {
        super(message, 403, details);
    }
}
