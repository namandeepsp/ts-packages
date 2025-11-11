# @naman_deep_singh/security

Security utilities for password hashing and JWT token management.

## Installation

```bash
npm install @naman_deep_singh/security
or
pnpm add @naman_deep_singh/security
or
yarn add @naman_deep_singh/security
```

## Usage

```typescript
import { hashPassword, verifyPassword, generateToken, verifyToken } from '@naman_deep_singh/security';

// Password hashing
const hashedPassword = await hashPassword('mypassword');
const isValid = await verifyPassword('mypassword', hashedPassword);

// JWT tokens
const token = generateToken({ userId: 1 }, 'your-secret-key');
const decoded = verifyToken(token, 'your-secret-key');
```

## API

### Password Functions
- `hashPassword(password: string): Promise<string>` - Hash a password using bcrypt
- `verifyPassword(password: string, hash: string): Promise<boolean>` - Verify password against hash

### JWT Functions
- `generateToken(payload: object, secret: string, expiresIn?: string): string` - Generate JWT token
- `verifyToken(token: string, secret: string): any` - Verify and decode JWT token

## Dependencies

- bcryptjs - For password hashing
- jsonwebtoken - For JWT token management