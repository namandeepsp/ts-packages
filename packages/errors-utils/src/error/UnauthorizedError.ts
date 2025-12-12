import { HTTPError } from "./HTTPError";

export class UnauthorizedError extends HTTPError {
    constructor(message = "Unauthorized", details?: any) {
        super(message, 401, details);
    }
}
