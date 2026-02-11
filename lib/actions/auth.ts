'use server'

/**
 * Authentication Server Actions
 * Supabase Auth operations for sign up, sign in, sign out, profile management
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { checkRateLimit, RATE_LIMITS } from '@/lib/utils/rate-limit'
import {
    signUpSchema,
    signInSchema,
    updateProfileSchema,
    changePasswordSchema,
    type SignUpInput,
    type SignInInput,
    type UpdateProfileInput,
    type ChangePasswordInput,
} from '@/lib/validations/auth'
import type {
    SignUpResult,
    SignInResult,
    SignOutResult,
    GetCurrentUserResult,
    UpdateProfileResult,
    ChangePasswordResult,
} from '@/types/auth'
import type { Database } from '@/types/database'

type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']
type UserProfileRow = Database['public']['Tables']['user_profiles']['Row']

/**
 * Format Zod errors into a single user-friendly string
 */
function formatValidationErrors(error: import('zod').ZodError): string {
    return error.errors.map((e) => e.message).join('. ')
}

/**
 * Get a rate limit key based on the client IP address
 */
async function getRateLimitKey(action: string): Promise<string> {
    const h = await headers()
    const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
    return `${action}:${ip}`
}

/**
 * Sign up a new user with email and password
 * Creates auth user and user_profiles entry
 */
export async function signUp(input: SignUpInput): Promise<SignUpResult> {
    // Rate limit check
    const rateLimitKey = await getRateLimitKey('signUp')
    const rateCheck = checkRateLimit(rateLimitKey, RATE_LIMITS.auth)
    if (!rateCheck.allowed) {
        return {
            user: null,
            error: {
                message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
                code: 'RATE_LIMITED',
            },
        }
    }

    const parsed = signUpSchema.safeParse(input)
    if (!parsed.success) {
        return {
            user: null,
            error: {
                message: formatValidationErrors(parsed.error),
                code: 'VALIDATION_ERROR',
            },
        }
    }

    const { email, password, displayName } = parsed.data
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                display_name: displayName || null,
            },
        },
    })

    if (error) {
        let code = 'SIGNUP_ERROR'
        let message = 'Đăng ký thất bại. Vui lòng thử lại.'

        if (error.message?.includes('already registered') || error.status === 409) {
            code = 'EMAIL_EXISTS'
            message = 'Email đã được đăng ký. Vui lòng sử dụng email khác.'
        } else if (error.message?.includes('password')) {
            code = 'WEAK_PASSWORD'
            message = 'Mật khẩu không đủ mạnh.'
        }

        return { user: null, error: { message, code } }
    }

    if (data.user) {
        // Create user profile
        const profileData: UserProfileInsert = {
            id: data.user.id,
            display_name: displayName || null,
            preferred_unit_system: 'metric',
            dietary_preferences: [],
        }
        const { error: profileError } = await supabase
            .from('user_profiles')
            .insert(profileData as never)

        if (profileError) {
            console.error('Failed to create user profile:', profileError)
        }

        revalidatePath('/', 'layout')
        redirect('/')
    }

    return {
        user: null,
        error: { message: 'Đăng ký thất bại. Vui lòng thử lại.', code: 'SIGNUP_ERROR' },
    }
}

/**
 * Sign in with email and password
 */
export async function signIn(input: SignInInput): Promise<SignInResult> {
    // Rate limit check
    const rateLimitKey = await getRateLimitKey('signIn')
    const rateCheck = checkRateLimit(rateLimitKey, RATE_LIMITS.auth)
    if (!rateCheck.allowed) {
        return {
            user: null,
            error: {
                message: 'Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau.',
                code: 'RATE_LIMITED',
            },
        }
    }

    const parsed = signInSchema.safeParse(input)
    if (!parsed.success) {
        return {
            user: null,
            error: {
                message: formatValidationErrors(parsed.error),
                code: 'VALIDATION_ERROR',
            },
        }
    }

    const { email, password } = parsed.data
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return {
            user: null,
            error: {
                message: 'Email hoặc mật khẩu không đúng.',
                code: 'INVALID_CREDENTIALS',
            },
        }
    }

    if (data.user) {
        revalidatePath('/', 'layout')
        redirect('/')
    }

    return {
        user: null,
        error: { message: 'Đăng nhập thất bại.', code: 'SIGNIN_ERROR' },
    }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<SignOutResult> {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
        return {
            success: false,
            error: {
                message: 'Đăng xuất thất bại.',
                code: 'SIGNOUT_ERROR',
            },
        }
    }

    revalidatePath('/', 'layout')
    redirect('/login')
}

/**
 * Get the currently authenticated user with profile data
 */
export async function getCurrentUser(): Promise<GetCurrentUserResult> {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return { user: null }
    }

    // Fetch profile data
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single() as unknown as { data: UserProfileRow | null }

    if (!profile) {
        return {
            user: {
                id: user.id,
                email: user.email!,
                createdAt: user.created_at,
                displayName: null,
                preferredUnitSystem: 'metric',
                dietaryPreferences: [],
                updatedAt: user.created_at,
            },
        }
    }

    return {
        user: {
            id: user.id,
            email: user.email!,
            createdAt: user.created_at,
            displayName: profile.display_name,
            preferredUnitSystem: profile.preferred_unit_system,
            dietaryPreferences: (profile.dietary_preferences as string[]) || [],
            updatedAt: profile.updated_at,
        },
    }
}

/**
 * Update user profile (display name, unit system, dietary preferences)
 */
export async function updateUserProfile(
    input: UpdateProfileInput
): Promise<UpdateProfileResult> {
    const parsed = updateProfileSchema.safeParse(input)
    if (!parsed.success) {
        return {
            profile: null,
            error: {
                message: formatValidationErrors(parsed.error),
                code: 'VALIDATION_ERROR',
            },
        }
    }

    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return {
            profile: null,
            error: {
                message: 'Bạn cần đăng nhập để cập nhật hồ sơ.',
                code: 'UNAUTHORIZED',
            },
        }
    }

    const updateData: UserProfileUpdate = {}
    if (parsed.data.displayName !== undefined) {
        updateData.display_name = parsed.data.displayName
    }
    if (parsed.data.preferredUnitSystem !== undefined) {
        updateData.preferred_unit_system = parsed.data.preferredUnitSystem
    }
    if (parsed.data.dietaryPreferences !== undefined) {
        updateData.dietary_preferences = parsed.data.dietaryPreferences
    }

    const { data: profile, error } = await supabase
        .from('user_profiles')
        .update(updateData as never)
        .eq('id', user.id)
        .select()
        .single() as unknown as { data: UserProfileRow | null; error: { message: string } | null }

    if (error || !profile) {
        return {
            profile: null,
            error: {
                message: 'Cập nhật hồ sơ thất bại.',
                code: 'UPDATE_ERROR',
            },
        }
    }

    revalidatePath('/profile')

    return {
        profile: {
            id: profile.id,
            displayName: profile.display_name,
            preferredUnitSystem: profile.preferred_unit_system,
            dietaryPreferences: (profile.dietary_preferences as string[]) || [],
            createdAt: profile.created_at,
            updatedAt: profile.updated_at,
        },
        error: null,
    }
}

/**
 * Change user password (requires current password)
 */
export async function changePassword(
    input: ChangePasswordInput
): Promise<ChangePasswordResult> {
    const parsed = changePasswordSchema.safeParse(input)
    if (!parsed.success) {
        return {
            success: false,
            error: {
                message: formatValidationErrors(parsed.error),
                code: 'VALIDATION_ERROR',
            },
        }
    }

    const { currentPassword, newPassword } = parsed.data
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
        return {
            success: false,
            error: {
                message: 'Bạn cần đăng nhập để đổi mật khẩu.',
                code: 'UNAUTHORIZED',
            },
        }
    }

    // Verify current password by re-authenticating
    const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
    })

    if (verifyError) {
        return {
            success: false,
            error: {
                message: 'Mật khẩu hiện tại không đúng.',
                code: 'INVALID_CREDENTIALS',
            },
        }
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
    })

    if (updateError) {
        return {
            success: false,
            error: {
                message: 'Đổi mật khẩu thất bại. Vui lòng thử lại.',
                code: 'PASSWORD_UPDATE_ERROR',
            },
        }
    }

    return { success: true, error: null }
}
