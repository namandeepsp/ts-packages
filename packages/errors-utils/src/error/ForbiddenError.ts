import { HTTPError } from "./HTTPError";

export class ForbiddenError extends HTTPError {
    constructor(message = "Forbidden", details?: any) {
        super(message, 403, details);
    }
}
