import { HTTPError } from "./HTTPError";

export class InternalServerError extends HTTPError {
    constructor(message = "Internal Server Error", details?: any) {
        super(message, 500, details);
    }
}
