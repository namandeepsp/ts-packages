import { ExpressResponder, HTTP_STATUS } from "node_modules/@naman_deep_singh/response-utils/dist/cjs";
import { AppError } from "src/error/AppError";

export function mapAppErrorToResponder(responder: ExpressResponder<any>, err: AppError) {
    switch (err.statusCode) {
        case HTTP_STATUS.CLIENT_ERROR.BAD_REQUEST:
            return responder.badRequest(err.message, { details: err.details });

        case HTTP_STATUS.CLIENT_ERROR.UNAUTHORIZED:
            return responder.unauthorized(err.message);

        case HTTP_STATUS.CLIENT_ERROR.FORBIDDEN:
            return responder.forbidden(err.message);

        case HTTP_STATUS.CLIENT_ERROR.NOT_FOUND:
            return responder.notFound(err.message);

        case HTTP_STATUS.CLIENT_ERROR.CONFLICT:
            return responder.conflict(err.message);

        default:
            // Any other custom status maps to a generic server error
            return responder.serverError(err.message, { details: err.details });
    }
}
