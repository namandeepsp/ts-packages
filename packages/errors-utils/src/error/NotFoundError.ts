import { HTTPError } from "./HTTPError";

export class NotFoundError extends HTTPError {
    constructor(message = "Not Found", details?: any) {
        super(message, 404, details);
    }
}
