```bash
@naman_deep_singh/security

Version: 1.6.0

A complete, lightweight security toolkit for Node.js & TypeScript providing:

🔐 Password hashing & validation with bcrypt (async/sync, peppered variants)
🔑 JWT signing & verification (safe, strict, and cached)
🧮 Duration parser ("15m", "7d", etc.)
🪪 Token generator (access + refresh pair with branded types)
♻️ Refresh token rotation helper
🧰 Robust token extraction (Headers, Cookies, Query, Body, WebSocket)
🧩 Safe & strict JWT decode utilities
🔒 AES-256-GCM encryption/decryption with HMAC and random utilities
🚨 Standardized error handling with @naman_deep_singh/errors

✔ Fully typed with TypeScript
✔ Branded token types for compile-time safety (AccessToken/RefreshToken)
✔ Class-based managers for advanced features (PasswordManager, JWTManager, CryptoManager)
✔ Functional exports for simple use cases
✔ Password strength checking and validation
✔ Token caching for performance
✔ Consistent errors across your application ecosystem
✔ Works in both ESM and CommonJS

📦 Installation
npm install @naman_deep_singh/security

🔧 Features
Password Security

Async & sync bcrypt hashing

Peppered hashing variants

Password validation & strength checking

Configurable complexity requirements

Secure password generation

JWT Security

Custom expiry using duration strings

Token pair generation (access + refresh)

Refresh token rotation

Safe & unsafe JWT verification

Strict vs flexible decoding

Token caching for performance

Cryptography

AES-256-GCM encryption/decryption

HMAC signing and verification

Cryptographically secure random generation

Utilities

Duration parsing (e.g., "15m" → 900 seconds)

Token extraction from headers, cookies, query, body, and WebSocket messages

Fully typed interfaces and branded token types

📘 Quick Start
Functional Approach (Simple)
import {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyToken,
  safeVerifyToken,
  extractToken,
  encrypt,
  decrypt,
  parseDuration,
  decodeToken,
  decodeTokenStrict,
} from "@naman_deep_singh/security";

// Password operations
const hashed = await hashPassword("mypassword");
const isValid = await verifyPassword("mypassword", hashed);

// JWT operations
const tokens = generateTokens(
  { userId: 42 },
  process.env.ACCESS_SECRET!,
  process.env.REFRESH_SECRET!,
  "15m",
  "7d"
);

// Safe verification
const result = safeVerifyToken(tokens.accessToken, process.env.ACCESS_SECRET!);
if (!result.valid) {
  console.log(result.error.message); // UnauthorizedError instance
}

// Decode without verification
const decoded = decodeToken(tokens.accessToken); // null | string | JwtPayload
const strictPayload = decodeTokenStrict(tokens.accessToken); // throws if invalid

// Parse duration
const seconds = parseDuration("15m"); // 900

// Token extraction
const token = extractToken({
  header: req.headers.authorization,
  cookies: req.cookies,
  query: req.query,
  body: req.body,
  wsMessage: message, // string or { token: "..." }
});

// Crypto operations
const encrypted = encrypt("sensitive data", "secret-key");
const decrypted = decrypt(encrypted, "secret-key");

Class-Based Approach (Advanced)
PasswordManager
import { PasswordManager } from "@naman_deep_singh/security";

const passwordManager = new PasswordManager({
  minLength: 12,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  customRules: [
    { test: (pwd) => !pwd.includes("password"), message: 'Cannot contain "password"' }
  ]
});

// Validate password
const validation = passwordManager.validate("MySecurePass123!");
if (!validation.isValid) console.log(validation.errors);

// Hash password
const { hash, salt } = await passwordManager.hash("MySecurePass123!");

// Verify password
const isValid = await passwordManager.verify("MySecurePass123!", hash, salt);

// Generate secure password
const generated = passwordManager.generate(16, {
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: true
});

// Check password strength
const strength = passwordManager.checkStrength("MySecurePass123!");
console.log(strength);

JWTManager
import { JWTManager } from "@naman_deep_singh/security";

const jwtManager = new JWTManager({
  accessSecret: process.env.ACCESS_SECRET!,
  refreshSecret: process.env.REFRESH_SECRET!,
  accessExpiry: "15m",
  refreshExpiry: "7d",
  enableCaching: true,
  maxCacheSize: 100
});

// Generate tokens
const tokens = await jwtManager.generateTokens({ userId: 42 });

// Verify tokens
const accessPayload = await jwtManager.verifyAccessToken(tokens.accessToken);
const refreshPayload = await jwtManager.verifyRefreshToken(tokens.refreshToken);

// Rotate refresh token
const rotatedRefreshToken = await jwtManager.rotateRefreshToken(tokens.refreshToken);

// Decode without verification
const decoded = jwtManager.decodeToken(tokens.accessToken);
const strictPayload = jwtManager.decodeTokenStrict(tokens.accessToken);

// Extract token from header
const token = jwtManager.extractTokenFromHeader("Bearer eyJ...");

// Validate token without throwing
const isValid = jwtManager.validateToken(tokens.accessToken, process.env.ACCESS_SECRET!);

// Check token expiration
const isExpired = jwtManager.isTokenExpired(tokens.accessToken);
const expiresAt = jwtManager.getTokenExpiration(tokens.accessToken);

// Cache management
jwtManager.clearCache();
const stats = jwtManager.getCacheStats(); // { size: -1, maxSize: 100 }

CryptoManager
import { CryptoManager } from "@naman_deep_singh/security";

const cryptoManager = new CryptoManager("your-secret-key");

// Encryption
const encrypted = cryptoManager.encrypt("data");
const decrypted = cryptoManager.decrypt(encrypted);

// HMAC
const hmac = cryptoManager.createHMAC("data");
const isValid = cryptoManager.verifyHMAC("data", hmac);

// Random generation
const randomBytes = cryptoManager.generateRandomBytes(32);
const randomString = cryptoManager.generateRandomString(16);
const randomHex = cryptoManager.generateRandomHex(32);

🚨 Error Handling

This package uses standardized errors from @naman_deep_singh/errors:

import {
  BadRequestError,
  UnauthorizedError,
  ValidationError,
  InternalServerError
} from '@naman_deep_singh/security';

try {
  const hash = await hashPassword('mypassword');
} catch (error) {
  if (error instanceof BadRequestError) console.log("Invalid password input");
  if (error instanceof InternalServerError) console.log("Server error during hashing");
}

try {
  const isValid = await verifyPassword('password', hash);
} catch (error) {
  if (error instanceof UnauthorizedError) console.log("Invalid credentials");
}


Error Types:

BadRequestError (400) — invalid input

UnauthorizedError (401) — authentication failures

ValidationError (422) — password strength validation

InternalServerError (500) — server-side errors

🧩 Authentication Example
Registration
async function registerUser(email: string, password: string) {
  const validation = passwordManager.validate(password);
  if (!validation.isValid) {
    throw new ValidationError(`Password validation failed: ${validation.errors.join(', ')}`);
  }

  const { hash, salt } = await passwordManager.hash(password);

  return { email, passwordHash: hash, passwordSalt: salt };
}

Login
async function loginUser(email: string, password: string, storedHash: string, storedSalt: string) {
  const isValid = await passwordManager.verify(password, storedHash, storedSalt);
  if (!isValid) throw new UnauthorizedError("Invalid credentials");

  return jwtManager.generateTokens({ email });
}

Token Refresh
async function refreshTokens(oldRefreshToken: string) {
  const decoded = await jwtManager.verifyRefreshToken(oldRefreshToken);

  const newTokens = await jwtManager.generateTokens(decoded);
  const rotatedRefreshToken = await jwtManager.rotateRefreshToken(oldRefreshToken);

  return { accessToken: newTokens.accessToken, refreshToken: rotatedRefreshToken };
}

Express Middleware
import { extractToken, safeVerifyToken } from '@naman_deep_singh/security';

export function authMiddleware(req, res, next) {
  const token = extractToken({
    header: req.headers.authorization,
    cookies: req.cookies,
    query: req.query,
    body: req.body
  });

  if (!token) return res.status(401).json({ error: "Token missing" });

  const result = safeVerifyToken(token, process.env.ACCESS_SECRET!);
  if (!result.valid) return res.status(401).json({ error: result.error.message });

  req.user = result.payload;
  next();
}

🔐 Security Best Practices

Use 32+ character secrets for JWT and encryption

Store secrets in environment variables

Always use HTTPS in production

Keep refresh tokens secure (HttpOnly cookie recommended)

Never store passwords in plain text

Use password peppering for extra security

Enable JWT caching carefully, monitor memory

Handle errors with proper HTTP status codes

Rotate secrets and tokens regularly

Use secure random generation for cryptographic operations
```