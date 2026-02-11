# Authentication API Contracts

**Feature**: Recipe Planner - User Authentication & Profile Management  
**Type**: Supabase Auth + Next.js Server Actions  
**Date**: February 11, 2026

## Overview

This document defines authentication contracts using Supabase Auth for email/password authentication, session management, and user profile operations. All auth operations use Supabase Auth helpers for Next.js.

## Supabase Auth Operations

### 1. Sign Up (Create Account)

**Purpose**: Register a new user with email and password

**Type**: Server Action  
**Function**: `signUp()`  
**File**: `lib/actions/auth.ts`

**Input Schema**:
```typescript
{
  email: string;
  password: string;
  displayName?: string;  // Optional display name
}
```

**Output Schema**:
```typescript
{
  user: {
    id: string;
    email: string;
    createdAt: string;
  } | null;
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  } | null;
  error: {
    message: string;
    code: string;
  } | null;
}
```

**Validation Rules**:
- `email`: Must be valid email format, max 255 characters
- `password`: Minimum 8 characters, must contain at least one letter and one number
- `displayName`: Optional, max 100 characters if provided

**Business Logic**:
1. Call `supabase.auth.signUp({ email, password })`
2. If successful, create entry in `user_profiles` table with user ID
3. Set display_name if provided
4. Return user object and session tokens
5. Automatically signs user in after registration

**Side Effects**:
- Creates row in Supabase `auth.users` table
- Creates row in `user_profiles` table
- Sets auth cookie for session

**Error Responses**:
- `400`: Invalid email format or weak password
- `409`: Email already registered
- `422`: Email not allowed (disposable email domains blocked)
- `500`: Database error

---

### 2. Sign In (Login)

**Purpose**: Authenticate existing user with email and password

**Type**: Server Action  
**Function**: `signIn()`  
**File**: `lib/actions/auth.ts`

**Input Schema**:
```typescript
{
  email: string;
  password: string;
}
```

**Output Schema**:
```typescript
{
  user: {
    id: string;
    email: string;
  } | null;
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  } | null;
  error: {
    message: string;
    code: string;
  } | null;
}
```

**Validation Rules**:
- `email`: Required, valid email format
- `password`: Required, minimum 1 character (any password for validation)

**Business Logic**:
1. Call `supabase.auth.signInWithPassword({ email, password })`
2. If successful, return user and session
3. Set auth cookie with session tokens
4. Redirect to intended page or home

**Error Responses**:
- `400`: Invalid email format
- `401`: Invalid credentials (wrong email or password)
- `500`: Authentication service error

---

### 3. Sign Out (Logout)

**Purpose**: End user session and clear authentication

**Type**: Server Action  
**Function**: `signOut()`  
**File**: `lib/actions/auth.ts`

**Input Schema**:
```typescript
{} // No parameters needed
```

**Output Schema**:
```typescript
{
  success: boolean;
}
```

**Business Logic**:
1. Call `supabase.auth.signOut()`
2. Clear auth cookies
3. Invalidate session on server
4. Redirect to login page

**Error Responses**:
- `500`: Logout error (rare, usually succeeds even if already logged out)

---

### 4. Get Current User

**Purpose**: Retrieve currently authenticated user's information

**Type**: Server Action  
**Function**: `getCurrentUser()`  
**File**: `lib/actions/auth.ts`

**Input Schema**:
```typescript
{} // No parameters (reads from session cookie)
```

**Output Schema**:
```typescript
{
  user: {
    id: string;
    email: string;
    displayName: string | null;
    preferredUnitSystem: "metric" | "imperial";
    dietaryPreferences: string[];
    createdAt: string;
  } | null;
}
```

**Business Logic**:
1. Get session from cookie using `createServerComponentClient()`
2. Get user from `auth.getUser()`
3. Join with `user_profiles` to get extended profile data
4. Return null if no active session

**Use Cases**:
- Check authentication status in layouts
- Display user info in navigation
- Enforce protected routes

**Error Responses**:
- Returns `null` for user if not authenticated (not an error)
- `500`: Database error retrieving profile

---

### 5. Update User Profile

**Purpose**: Modify user's display name, unit preference, or dietary preferences

**Type**: Server Action  
**Function**: `updateUserProfile()`  
**File**: `lib/actions/auth.ts`

**Input Schema**:
```typescript
{
  displayName?: string;
  preferredUnitSystem?: "metric" | "imperial";
  dietaryPreferences?: string[];  // e.g., ["vegetarian", "gluten-free"]
}
```

**Output Schema**:
```typescript
{
  profile: {
    id: string;
    displayName: string | null;
    preferredUnitSystem: "metric" | "imperial";
    dietaryPreferences: string[];
    updatedAt: string;
  };
}
```

**Validation Rules**:
- `displayName`: Max 100 characters if provided
- `preferredUnitSystem`: Must be "metric" or "imperial"
- `dietaryPreferences`: Array of strings, max 20 items, each max 50 chars
- At least one field must be provided

**Business Logic**:
1. Verify user is authenticated
2. Update `user_profiles` table where `id = auth.uid()`
3. Return updated profile

**Error Responses**:
- `400`: Invalid input format
- `401`: User not authenticated
- `500`: Database update error

---

### 6. Change Password

**Purpose**: Update user's password (requires current password)

**Type**: Server Action  
**Function**: `changePassword()`  
**File**: `lib/actions/auth.ts`

**Input Schema**:
```typescript
{
  currentPassword: string;
  newPassword: string;
}
```

**Output Schema**:
```typescript
{
  success: boolean;
  error: {
    message: string;
    code: string;
  } | null;
}
```

**Validation Rules**:
- `currentPassword`: Required
- `newPassword`: Minimum 8 characters, must contain letter and number
- `newPassword` must be different from `currentPassword`

**Business Logic**:
1. Re-authenticate user with current password
2. If successful, call `supabase.auth.updateUser({ password: newPassword })`
3. Force sign-out of all other sessions (security measure)
4. Keep current session active

**Error Responses**:
- `400`: Invalid password format or same as current
- `401`: Current password incorrect
- `500`: Password update error

---

### 7. Request Password Reset

**Purpose**: Send password reset email to user

**Type**: Server Action  
**Function**: `requestPasswordReset()`  
**File**: `lib/actions/auth.ts`

**Input Schema**:
```typescript
{
  email: string;
}
```

**Output Schema**:
```typescript
{
  success: boolean;
  message: string;  // "Password reset email sent" (even if email doesn't exist, for security)
}
```

**Validation Rules**:
- `email`: Must be valid email format

**Business Logic**:
1. Call `supabase.auth.resetPasswordForEmail(email)`
2. Always return success (don't reveal if email exists)
3. Email contains magic link to reset password page

**Error Responses**:
- `400`: Invalid email format
- `500`: Email service error

---

### 8. Reset Password with Token

**Purpose**: Complete password reset using token from email link

**Type**: Server Action  
**Function**: `resetPasswordWithToken()`  
**File**: `lib/actions/auth.ts`

**Input Schema**:
```typescript
{
  token: string;      // From email link query parameter
  newPassword: string;
}
```

**Output Schema**:
```typescript
{
  success: boolean;
  error: {
    message: string;
  } | null;
}
```

**Validation Rules**:
- `token`: Required, string
- `newPassword`: Minimum 8 characters, must contain letter and number

**Business Logic**:
1. Verify token with Supabase
2. If valid, update user password
3. Automatically sign user in
4. Redirect to home page

**Error Responses**:
- `400`: Invalid password format or expired token
- `401`: Invalid or expired reset token
- `500`: Password reset error

---

### 9. Delete Account

**Purpose**: Permanently delete user account and all associated data

**Type**: Server Action  
**Function**: `deleteAccount()`  
**File**: `lib/actions/auth.ts`

**Input Schema**:
```typescript
{
  password: string;  // Require password confirmation
  confirmation: string;  // Must type "DELETE" to confirm
}
```

**Output Schema**:
```typescript
{
  success: boolean;
  error: {
    message: string;
  } | null;
}
```

**Validation Rules**:
- `password`: Required for authentication
- `confirmation`: Must exactly match "DELETE" (case-sensitive)

**Business Logic**:
1. Re-authenticate user with password
2. Delete user from Supabase Auth (triggers cascade deletion via RLS)
3. All user data automatically deleted via `ON DELETE CASCADE`:
   - user_profiles
   - saved_recipes
   - meal_plan_entries
   - grocery_list_items
4. Sign out user
5. Redirect to goodbye page

**Error Responses**:
- `400`: Invalid confirmation text
- `401`: Incorrect password
- `500`: Account deletion error

---

## Session Management

### Server-Side Session Handling

```typescript
// lib/supabase/server.ts

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createServerSupabaseClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

### Client-Side Session Handling

```typescript
// lib/supabase/client.ts

import { createBrowserClient } from '@supabase/ssr'

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Middleware for Protected Routes

```typescript
// middleware.ts

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )
  
  const { data: { session } } = await supabase.auth.getSession()
  
  // Redirect to login if accessing protected route without session
  if (!session && request.nextUrl.pathname.startsWith('/cookbook')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return response
}

export const config = {
  matcher: ['/cookbook/:path*', '/planner/:path*', '/grocery/:path*', '/profile/:path*']
}
```

## TypeScript Types

```typescript
// lib/types/auth.ts

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  displayName: string | null;
  preferredUnitSystem: 'metric' | 'imperial';
  dietaryPreferences: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthError {
  message: string;
  code: string;
}

export interface SignUpResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface SignInResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}
```

## Zod Validation Schemas

```typescript
// lib/validations/auth.ts

import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: passwordSchema,
  displayName: z.string().max(100).optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  displayName: z.string().max(100).optional(),
  preferredUnitSystem: z.enum(['metric', 'imperial']).optional(),
  dietaryPreferences: z.array(z.string().max(50)).max(20).optional(),
}).refine(
  data => data.displayName !== undefined || 
          data.preferredUnitSystem !== undefined || 
          data.dietaryPreferences !== undefined,
  { message: 'At least one field must be provided' }
);

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema,
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1),
  confirmation: z.literal('DELETE', {
    errorMap: () => ({ message: 'Please type DELETE to confirm' })
  }),
});
```

## Security Considerations

- **Password Requirements**: Enforced both client and server-side (min 8 chars, letter + number)
- **Session Duration**: Default 1 hour, refresh token valid for 7 days
- **CSRF Protection**: Supabase auth helpers handle CSRF tokens automatically
- **Rate Limiting**: Implement rate limiting on auth endpoints (max 5 attempts per minute)
- **Email Verification**: Optional email verification can be enabled in Supabase dashboard
- **Secure Cookies**: Auth cookies set with `httpOnly`, `secure`, `sameSite: 'lax'`
- **Password Reset**: Tokens expire after 1 hour
- **Account Deletion**: Requires password confirmation to prevent accidental deletion

## Error Handling

All auth errors return standardized format:
```typescript
{
  error: {
    message: string;  // User-friendly message
    code: string;     // Machine-readable error code
  }
}
```

Common error codes:
- `INVALID_CREDENTIALS`: Wrong email or password
- `EMAIL_EXISTS`: Email already registered
- `WEAK_PASSWORD`: Password doesn't meet requirements
- `INVALID_TOKEN`: Expired or invalid reset token
- `USER_NOT_FOUND`: Email not in system (password reset)
- `SESSION_EXPIRED`: Auth session expired, re-login required
