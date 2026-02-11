/**
 * Authentication TypeScript Types
 * Types for auth operations, user profile, and session management
 */

export interface AuthUser {
    id: string
    email: string
    createdAt: string
}

export interface UserProfile {
    id: string
    displayName: string | null
    preferredUnitSystem: 'metric' | 'imperial'
    dietaryPreferences: string[]
    createdAt: string
    updatedAt: string
}

export interface AuthSession {
    accessToken: string
    refreshToken: string
    expiresAt: number
}

export interface AuthError {
    message: string
    code: string
}

export interface SignUpResult {
    user: AuthUser | null
    error: AuthError | null
}

export interface SignInResult {
    user: AuthUser | null
    error: AuthError | null
}

export interface SignOutResult {
    success: boolean
    error: AuthError | null
}

export interface GetCurrentUserResult {
    user: (AuthUser & UserProfile) | null
}

export interface UpdateProfileResult {
    profile: UserProfile | null
    error: AuthError | null
}

export interface ChangePasswordResult {
    success: boolean
    error: AuthError | null
}

/**
 * Auth state for client-side context
 */
export interface AuthState {
    user: (AuthUser & UserProfile) | null
    isLoading: boolean
    isAuthenticated: boolean
}
