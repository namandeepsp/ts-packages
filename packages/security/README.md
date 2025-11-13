# @naman_deep_singh/security

Security utilities for password hashing and JWT token management with TypeScript support.

## Installation

```bash
npm install @naman_deep_singh/security
```

## Features

- ✅ **Password hashing** with bcrypt (salt rounds: 10)
- ✅ **JWT token management** with configurable expiration
- ✅ **TypeScript support** with full type safety
- ✅ **Hybrid exports** - use named imports or namespace imports
- ✅ **Backward compatibility** with legacy function names
- ✅ **Async/await support** for all operations

## Usage

### Named Imports (Tree-shakable)
```typescript
import { hashPassword, verifyPassword, generateToken, verifyToken } from '@naman_deep_singh/security';

// Password hashing
const hashedPassword = await hashPassword('mypassword');
const isValid = await verifyPassword('mypassword', hashedPassword);

// JWT tokens
const token = generateToken({ userId: 1, role: 'admin' }, 'your-secret-key', '24h');
const decoded = verifyToken(token, 'your-secret-key');
```

### Namespace Import
```typescript
import SecurityUtils from '@naman_deep_singh/security';

const hashedPassword = await SecurityUtils.hashPassword('mypassword');
const token = SecurityUtils.generateToken({ userId: 1 }, 'secret');
```

### Backward Compatibility
```typescript
import { comparePassword, signToken } from '@naman_deep_singh/security';

// Legacy function names still work
const isValid = await comparePassword('password', 'hash');
const token = signToken({ userId: 1 }, 'secret');
```

## API Reference

### Password Functions
- `hashPassword(password: string): Promise<string>` - Hash a password using bcrypt with salt rounds 10
- `verifyPassword(password: string, hash: string): Promise<boolean>` - Verify password against hash
- `comparePassword(password: string, hash: string): Promise<boolean>` - Alias for verifyPassword (backward compatibility)

### JWT Functions
- `generateToken(payload: Record<string, unknown>, secret: Secret, expiresIn?: string): string` - Generate JWT token
- `verifyToken(token: string, secret: Secret): string | JwtPayload` - Verify and decode JWT token
- `signToken(payload: Record<string, unknown>, secret: Secret, expiresIn?: string): string` - Alias for generateToken (backward compatibility)

## Examples

### Complete Authentication Flow
```typescript
import { hashPassword, verifyPassword, generateToken, verifyToken } from '@naman_deep_singh/security';

// Registration
async function registerUser(email: string, password: string) {
  const hashedPassword = await hashPassword(password);
  // Save user with hashedPassword to database
  return { email, password: hashedPassword };
}

// Login
async function loginUser(email: string, password: string, storedHash: string) {
  const isValid = await verifyPassword(password, storedHash);
  
  if (!isValid) {
    throw new Error('Invalid credentials');
  }
  
  const token = generateToken(
    { email, loginTime: Date.now() },
    process.env.JWT_SECRET!,
    '7d'
  );
  
  return { token };
}

// Verify JWT
function authenticateRequest(token: string) {
  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET!);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

## Dependencies

- **bcryptjs** - For secure password hashing
- **jsonwebtoken** - For JWT token management

## Security Best Practices

1. **Use strong secrets** for JWT signing (minimum 32 characters)
2. **Set appropriate expiration times** for tokens
3. **Store JWT secrets in environment variables**
4. **Never log or expose hashed passwords**
5. **Use HTTPS** in production for token transmission