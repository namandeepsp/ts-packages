export * from "./core/password";
export * from "./core/jwt";
export * from "./core/crypto";

// Re-export common errors for convenience
export {
  BadRequestError,
  UnauthorizedError,
  ValidationError,
  InternalServerError
} from "@naman_deep_singh/errors-utils";

import * as PasswordUtils from "./core/password";
import * as JWTUtils from "./core/jwt";
import * as CryptoUtils from "./core/crypto";

export default {
  ...PasswordUtils,
  ...JWTUtils,
  ...CryptoUtils,
};
