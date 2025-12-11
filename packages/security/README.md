A complete, lightweight security toolkit for Node.js & TypeScript providing:

🔐 Password hashing & validation
🔑 JWT signing & verification (no deprecated expiresIn)
🧮 Duration parser ("15m", "7d", etc.)
🪪 Token generator (access + refresh pair)
♻️ Refresh token rotation helper
🧰 Robust token extraction (Headers, Cookies, Query, Body, WebSocket)
🧩 Safe & strict JWT decode utilities
✔ Fully typed with TypeScript
✔ Zero dependencies except bcrypt + jsonwebtoken
✔ Works in both ESM and CommonJS

```bash

📦 Installation
npm install @naman_deep_singh/security

🔧 Features

🔥 Password Hashing — secure & async (bcrypt with 10 salt rounds)

🔥 Custom Expiry JWT — manual exp support using duration strings

🔥 Token Pair Generation (accessToken + refreshToken)

🔥 Refresh Token Rotation

🔥 Safe & Unsafe JWT Verification

🔥 Strict vs Flexible Decoding

🔥 Universal Token Extraction (Headers, Cookies, Query, Body, WebSocket)

🔥 Duration Parser ("15m", "1h", "7d")

🔥 Production-grade types

📘 Quick Start
import {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyToken,
  safeVerifyToken,
  extractToken
} from "@naman_deep_singh/security";

📚 API Documentation

Below is a complete reference with full usage examples.

🧂 1. Password Utilities
hashPassword(password: string): Promise<string>
const hashed = await hashPassword("mypassword");
console.log(hashed); // $2a$10$...

verifyPassword(password: string, hash: string): Promise<boolean>
const isValid = await verifyPassword("mypassword", hashed);
if (isValid) console.log("Correct password");

comparePassword()

Alias for backward compatibility.

🔑 2. JWT Signing
signToken(payload, secret, expiresIn, options)

Creates a JWT with custom exp logic ("15m", "1h", "7d")

const token = signToken(
  { userId: 1 },
  process.env.JWT_SECRET!,
  "1h"
);

console.log(token);


✔ No deprecated expiresIn from jsonwebtoken
✔ Expiration is injected manually via exp

🧮 3. parseDuration()

Parses duration strings into seconds.

parseDuration("15m"); // 900
parseDuration("2h");  // 7200
parseDuration("7d");  // 604800


Useful for token expiry, cache expiry, rate limiting, etc.

🪪 4. generateTokens()

Generates access + refresh token pair.

const tokens = generateTokens(
  { userId: 42 },
  process.env.ACCESS_SECRET!,
  process.env.REFRESH_SECRET!,
  "15m",
  "7d"
);

console.log(tokens.accessToken);
console.log(tokens.refreshToken);

♻️ 5. rotateRefreshToken()

Creates a new refresh token using the old one:

import { rotateRefreshToken } from "@naman_deep_singh/security";

const newRefreshToken = rotateRefreshToken(
  oldRefreshToken,
  process.env.REFRESH_SECRET!
);


✔ Automatically removes old exp and iat
✔ Generates fresh expiration

🔍 6. verifyToken()

Throws if token is invalid or expired.

try {
  const payload = verifyToken(token, process.env.ACCESS_SECRET!);
  console.log("User authenticated:", payload);
} catch (err) {
  console.error("Invalid or expired token");
}

🛡 7. safeVerifyToken()

Never throws — returns { valid, payload?, error? }

const result = safeVerifyToken(token, process.env.ACCESS_SECRET!);

if (!result.valid) {
  console.log("Token invalid:", result.error);
} else {
  console.log("Token OK:", result.payload);
}

🧬 8. Decoding Helpers
decodeToken(token)

Flexible — returns null | string | JwtPayload

const decoded = decodeToken(token);
console.log(decoded);

decodeTokenStrict(token)

Throws if payload is not an object.

try {
  const payload = decodeTokenStrict(token);
  console.log(payload.userId);
} catch (e) {
  console.error("Invalid token payload");
}

🛰 9. extractToken()

Extracts tokens from:

Headers (Authorization: Bearer <token>)

Cookies (token, accessToken)

Query (?token=...)

Body ({ token: "" })

WebSocket messages (string or object)

Example: Express middleware
export function authMiddleware(req, res, next) {
  const token = extractToken({
    header: req.headers.authorization,
    cookies: req.cookies,
    query: req.query,
    body: req.body
  });

  if (!token) return res.status(401).json({ error: "Token missing" });

  try {
    req.user = verifyToken(token, process.env.ACCESS_SECRET!);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

Example: WebSocket (ws library)
ws.on("message", (msg) => {
  const token = extractToken({ wsMessage: msg });

  if (!token) return;

  const result = safeVerifyToken(token, process.env.ACCESS_SECRET!);

  if (result.valid) {
    console.log("WS authenticated user:", result.payload);
  }
});

🧩 10. Full Authentication Example
Registration
async function registerUser(email: string, password: string) {
  const hash = await hashPassword(password);

  return {
    email,
    passwordHash: hash
  };
}

Login
async function loginUser(email, password, storedHash) {
  const valid = await verifyPassword(password, storedHash);

  if (!valid) throw new Error("Invalid credentials");

  return generateTokens(
    { email },
    process.env.ACCESS_SECRET!,
    process.env.REFRESH_SECRET!,
    "15m",
    "7d"
  );
}

Token Refresh
function refresh(oldRefreshToken) {
  const newRefreshToken = rotateRefreshToken(
    oldRefreshToken,
    process.env.REFRESH_SECRET!
  );

  const decoded = decodeTokenStrict(oldRefreshToken);

  const newAccessToken = signToken(
    { userId: decoded.userId },
    process.env.ACCESS_SECRET!,
    "15m"
  );

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

🔐 Security Best Practices

✔ Use 32+ character secrets
✔ Store secrets in environment variables
✔ Always use HTTPS in production
✔ Keep refresh tokens secure (HttpOnly cookie recommended)
✔ Do not store passwords in plain text—ever

📜 License

MIT — free to use & modify.

```