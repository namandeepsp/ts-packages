import { HTTPError } from "./HTTPError";

export class BadRequestError extends HTTPError {
    constructor(message = "Bad Request", details?: unknown) {
        super(message, 400, details);
    }
}
