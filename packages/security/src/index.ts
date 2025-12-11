export * from "./core/password";
export * from "./core/jwt";
export * from "./core/crypto";

import * as PasswordUtils from "./core/password";
import * as JWTUtils from "./core/jwt";
import * as CryptoUtils from "./core/crypto";

export default {
  ...PasswordUtils,
  ...JWTUtils,
  ...CryptoUtils,
};
