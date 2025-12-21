# @naman_deep_singh/security

**Version:** 1.3.3

A complete, lightweight security toolkit for Node.js & TypeScript providing:

🔐 **Password hashing & validation** with bcrypt (async/sync, peppered variants)
🔑 **JWT signing & verification** (no deprecated expiresIn, with caching)
🧮 **Duration parser** ("15m", "7d", etc.)
🪪 **Token generator** (access + refresh pair with branded types)
♻️ **Refresh token rotation** helper
🧰 **Robust token extraction** (Headers, Cookies, Query, Body, WebSocket)
🧩 **Safe & strict JWT decode** utilities
🔒 **AES-256-GCM encryption/decryption** with HMAC and random utilities
🚨 **Standardized error handling** with @naman_deep_singh/errors-utils

✔ **Fully typed** with TypeScript
✔ **Branded token types** for compile-time safety (AccessToken/RefreshToken)
✔ **Class-based managers** for advanced features (PasswordManager, JWTManager, CryptoManager)
✔ **Functional exports** for simple use cases
✔ **Password strength checking** and validation
✔ **Token caching** for performance
✔ **Consistent errors** across your application ecosystem
✔ **Works in both ESM and CommonJS**

```bash
📦 Installation
npm install @naman_deep_singh/security
```

🔧 Features

🔥 Password Hashing — secure & async (bcrypt with 10 salt rounds)
🔥 Password Validation & Strength Checking
🔥 Password Generation with configurable requirements
🔥 Peppered hashing variants
🔥 Synchronous & asynchronous versions

🔥 Custom Expiry JWT — manual exp support using duration strings
🔥 Token Pair Generation (accessToken + refreshToken)
🔥 Refresh Token Rotation
🔥 Safe & Unsafe JWT Verification
🔥 Strict vs Flexible Decoding
🔥 Universal Token Extraction (Headers, Cookies, Query, Body, WebSocket)
🔥 Token caching for performance

🔥 AES-256-GCM Encryption/Decryption
🔥 HMAC signing and verification
🔥 Cryptographically secure random generation

🔥 Production-grade types and error handling

📘 Quick Start

### Functional Approach (Simple)
```typescript
import {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyToken,
  safeVerifyToken,
  extractToken,
  encrypt,
  decrypt
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

const result = safeVerifyToken(tokens.accessToken, process.env.ACCESS_SECRET!);

// Crypto operations
const encrypted = encrypt("sensitive data", "secret-key");
const decrypted = decrypt(encrypted, "secret-key");
```

### Class-Based Approach (Advanced)
```typescript
import { PasswordManager, JWTManager, CryptoManager } from "@naman_deep_singh/security";

// Password Manager with validation
const passwordManager = new PasswordManager({
  minLength: 12,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: true
});

const validation = passwordManager.validate("MySecurePass123!");
if (validation.isValid) {
  const hashed = await passwordManager.hash("MySecurePass123!");
}

// JWT Manager with caching
const jwtManager = new JWTManager({
  accessSecret: process.env.ACCESS_SECRET!,
  refreshSecret: process.env.REFRESH_SECRET!,
  accessExpiry: "15m",
  refreshExpiry: "7d",
  enableCaching: true
});

const tokens = await jwtManager.generateTokens({ userId: 42 });
const payload = await jwtManager.verifyAccessToken(tokens.accessToken);

// Crypto Manager
const cryptoManager = new CryptoManager("your-secret-key");
const encrypted = cryptoManager.encrypt("data");
const decrypted = cryptoManager.decrypt(encrypted);
```

📚 API Documentation

Below is a complete reference with full usage examples.

## 🧂 1. Password Utilities

### Functional Exports
```typescript
// Async hashing
const hashed = await hashPassword("mypassword"); // Uses 10 salt rounds by default
const hashed = await hashPassword("mypassword", 12); // Custom salt rounds

// Sync hashing
const hashedSync = hashPasswordSync("mypassword");
const hashedSync = hashPasswordSync("mypassword", 12);

// Peppered variants
const hashedPeppered = await hashPasswordWithPepper("mypassword", "pepper");
const hashedPepperedSync = hashPasswordWithPepperSync("mypassword", "pepper");

// Verification
const isValid = await verifyPassword("mypassword", hashed);
const isValidSync = verifyPasswordSync("mypassword", hashed);

// Peppered verification
const isValidPeppered = await verifyPasswordWithPepper("mypassword", "pepper", hashed);
const isValidPepperedSync = verifyPasswordWithPepperSync("mypassword", "pepper", hashed);
```

### PasswordManager Class
```typescript
const passwordManager = new PasswordManager({
  saltRounds: 12,
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  customRules: [
    { test: (pwd) => !pwd.includes('password'), message: 'Cannot contain "password"' }
  ]
});

// Hash with validation
const result = await passwordManager.hash("MySecurePass123!");
// Returns: { hash: "$2a$...", salt: "..." }

// Verify
const isValid = await passwordManager.verify("MySecurePass123!", result.hash, result.salt);

// Validate password
const validation = passwordManager.validate("MySecurePass123!");
/*
Returns: {
  isValid: true,
  errors: [],
  strength: { score: 4, label: 'strong', feedback: [...], suggestions: [...] }
}
*/

// Generate secure password
const generatedPassword = passwordManager.generate(16, {
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: true
});

// Check strength
const strength = passwordManager.checkStrength("MySecurePass123!");
/*
Returns: {
  score: 4,
  label: 'strong',
  feedback: [],
  suggestions: ["Your password is very secure"]
}
*/
```

## 🔑 2. JWT Utilities

### Functional Exports
```typescript
// Sign token with duration string
const token = signToken(
  { userId: 1, role: "admin" },
  process.env.JWT_SECRET!,
  "1h" // Duration string: "15m", "2h", "7d", "30s"
);

// Parse duration to seconds
parseDuration("15m"); // 900
parseDuration("2h");  // 7200
parseDuration("7d");  // 604800

// Generate token pair
const tokens = generateTokens(
  { userId: 42 },
  process.env.ACCESS_SECRET!,
  process.env.REFRESH_SECRET!,
  "15m",
  "7d"
);
// Returns: { accessToken: AccessToken, refreshToken: RefreshToken }

// Rotate refresh token
const newRefreshToken = rotateRefreshToken(
  oldRefreshToken,
  process.env.REFRESH_SECRET!
);

// Verify token (throws on error)
const payload = verifyToken(token, process.env.ACCESS_SECRET!);

// Safe verify (never throws)
const result = safeVerifyToken(token, process.env.ACCESS_SECRET!);
/*
Returns: {
  valid: true,
  payload: { userId: 1, ... },
  error?: undefined
}
*/

// Decode without verification
const decoded = decodeToken(token); // Flexible: null | string | JwtPayload
const payload = decodeTokenStrict(token); // Throws if not object

// Extract token from various sources
const token = extractToken({
  header: req.headers.authorization, // "Bearer <token>"
  cookies: req.cookies, // { token: "...", accessToken: "..." }
  query: req.query, // { token: "..." }
  body: req.body, // { token: "..." }
  wsMessage: message // string or { token: "..." }
});
```

### JWTManager Class
```typescript
const jwtManager = new JWTManager({
  accessSecret: process.env.ACCESS_SECRET!,
  refreshSecret: process.env.REFRESH_SECRET!,
  accessExpiry: "15m",
  refreshExpiry: "7d",
  enableCaching: true, // Optional caching
  maxCacheSize: 100 // Default 100
});

// Generate tokens
const tokens = await jwtManager.generateTokens({ userId: 42 });

// Verify tokens
const accessPayload = await jwtManager.verifyAccessToken(tokens.accessToken);
const refreshPayload = await jwtManager.verifyRefreshToken(tokens.refreshToken);

// Rotate refresh token
const newRefreshToken = await jwtManager.rotateRefreshToken(oldRefreshToken);

// Decode token
const decoded = jwtManager.decodeToken(token);

// Extract from header
const token = jwtManager.extractTokenFromHeader("Bearer eyJ...");

// Validate without throwing
const isValid = jwtManager.validateToken(token, secret);

// Check expiration
const isExpired = jwtManager.isTokenExpired(token);
const expiresAt = jwtManager.getTokenExpiration(token);

// Cache management
jwtManager.clearCache();
const stats = jwtManager.getCacheStats(); // { size: 5, maxSize: 100 }
```

## 🔒 3. Crypto Utilities

### Functional Exports
```typescript
// AES-256-GCM Encryption
const encrypted = encrypt("sensitive data", "your-secret-key");
// Returns: "iv:encrypted_data"

const decrypted = decrypt(encrypted, "your-secret-key");
// Returns: "sensitive data"

// HMAC
const hmac = createHMAC("data", "secret-key");
const isValidHMAC = verifyHMAC("data", hmac, "secret-key");

// Random generation
const randomBytes = generateRandomBytes(32); // Buffer
const randomString = generateRandomString(16); // Base64 string
const randomHex = generateRandomHex(32); // Hex string
```

### CryptoManager Class
```typescript
const cryptoManager = new CryptoManager("your-secret-key");

// Encryption
const encrypted = cryptoManager.encrypt("data");
const decrypted = cryptoManager.decrypt(encrypted);

// HMAC
const hmac = cryptoManager.createHMAC("data");
const isValid = cryptoManager.verifyHMAC("data", hmac);

// Random
const randomBytes = cryptoManager.generateRandomBytes(32);
const randomString = cryptoManager.generateRandomString(16);
```

## 🚨 Error Handling

This package uses standardized errors from `@naman_deep_singh/errors-utils`:

```typescript
import {
  hashPassword,
  verifyPassword,
  BadRequestError,
  UnauthorizedError,
  ValidationError,
  InternalServerError
} from '@naman_deep_singh/security';

try {
  const hash = await hashPassword('mypassword');
} catch (error) {
  if (error instanceof BadRequestError) {
    // Invalid password input (400)
    console.log('Invalid password provided');
  } else if (error instanceof InternalServerError) {
    // Hashing failed (500)
    console.log('Server error during hashing');
  }
}

try {
  const isValid = await verifyPassword('password', hash);
} catch (error) {
  if (error instanceof UnauthorizedError) {
    // Password verification failed (401)
    console.log('Invalid credentials');
  }
}
```

**Error Types:**
- `BadRequestError` (400) - Invalid input data
- `UnauthorizedError` (401) - Authentication failures
- `ValidationError` (422) - Password strength validation
- `InternalServerError` (500) - Server-side processing errors

## 🧩 Complete Authentication Example

### Registration with Validation
```typescript
import { PasswordManager, JWTManager } from '@naman_deep_singh/security';

const passwordManager = new PasswordManager({
  minLength: 12,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: true
});

const jwtManager = new JWTManager({
  accessSecret: process.env.ACCESS_SECRET!,
  refreshSecret: process.env.REFRESH_SECRET!,
  accessExpiry: "15m",
  refreshExpiry: "7d"
});

async function registerUser(email: string, password: string) {
  // Validate password strength
  const validation = passwordManager.validate(password);
  if (!validation.isValid) {
    throw new ValidationError(`Password validation failed: ${validation.errors.join(', ')}`);
  }

  // Hash password
  const { hash, salt } = await passwordManager.hash(password);

  // Store user with hash and salt
  return {
    email,
    passwordHash: hash,
    passwordSalt: salt
  };
}
```

### Login with Token Generation
```typescript
async function loginUser(email: string, password: string, storedHash: string, storedSalt: string) {
  // Verify password
  const isValid = await passwordManager.verify(password, storedHash, storedSalt);
  if (!isValid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // Generate tokens
  return jwtManager.generateTokens({ email });
}
```

### Token Refresh
```typescript
async function refreshTokens(oldRefreshToken: string) {
  // Verify old refresh token
  const decoded = await jwtManager.verifyRefreshToken(oldRefreshToken);

  // Generate new token pair
  const newTokens = await jwtManager.generateTokens(decoded);

  // Rotate refresh token
  const rotatedRefreshToken = await jwtManager.rotateRefreshToken(oldRefreshToken);

  return {
    accessToken: newTokens.accessToken,
    refreshToken: rotatedRefreshToken
  };
}
```

### Express Middleware
```typescript
import { extractToken, safeVerifyToken } from '@naman_deep_singh/security';

export function authMiddleware(req, res, next) {
  const token = extractToken({
    header: req.headers.authorization,
    cookies: req.cookies,
    query: req.query,
    body: req.body
  });

  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  const result = safeVerifyToken(token, process.env.ACCESS_SECRET!);

  if (!result.valid) {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.user = result.payload;
  next();
}
```

🔐 Security Best Practices

✔ Use 32+ character secrets for JWT and encryption
✔ Store secrets in environment variables
✔ Always use HTTPS in production
✔ Keep refresh tokens secure (HttpOnly cookie recommended)
✔ Do not store passwords in plain text—ever
✔ Use password peppering for additional security
✔ Implement proper password strength requirements
✔ Enable JWT caching for performance (but monitor memory usage)
✔ Handle errors appropriately with proper HTTP status codes
✔ Regularly rotate secrets and tokens
✔ Use secure random generation for all cryptographic operations

🔗 Integration with Other Packages

### With @naman_deep_singh/server-utils

```typescript
import { createServer } from '@naman_deep_singh/server-utils';
import { PasswordManager } from '@naman_deep_singh/security';

const server = createServer('Auth API', '1.0.0');
const passwordManager = new PasswordManager();

server.app.post('/register', async (req, res) => {
  try {
    const { password } = req.body;
    const hash = await passwordManager.hash(password);
    // Save user with hash...
    res.json({ success: true });
  } catch (error) {
    // Errors automatically handled by server-utils middleware
    throw error;
  }
});
```

### With @naman_deep_singh/errors-utils + @naman_deep_singh/response-utils

```typescript
import { expressErrorHandler } from '@naman_deep_singh/errors-utils';
import { responderMiddleware } from '@naman_deep_singh/response-utils';

server.app.use(responderMiddleware());
server.app.use(expressErrorHandler); // Handles security errors consistently
```

📜 License

MIT — free to use & modify.
