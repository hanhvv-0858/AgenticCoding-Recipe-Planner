/**
 * Authentication Validation Schemas
 * Zod schemas for auth operations with Vietnamese error messages
 */

import { z } from 'zod'
import { emailSchema, passwordSchema, displayNameSchema, unitSystemSchema } from '@/lib/schemas/common'

/**
 * Sign Up schema
 */
export const signUpSchema = z.object({
    email: emailSchema.pipe(z.string().max(255, 'Email tối đa 255 ký tự')),
    password: passwordSchema,
    displayName: displayNameSchema,
})

export type SignUpInput = z.infer<typeof signUpSchema>

/**
 * Sign In schema
 */
export const signInSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Mật khẩu không được để trống'),
})

export type SignInInput = z.infer<typeof signInSchema>

/**
 * Update Profile schema - at least one field must be provided
 */
export const updateProfileSchema = z
    .object({
        displayName: z.string().max(100, 'Tên hiển thị tối đa 100 ký tự').optional(),
        preferredUnitSystem: unitSystemSchema.optional(),
        dietaryPreferences: z
            .array(z.string().max(50, 'Mỗi sở thích ăn uống tối đa 50 ký tự'))
            .max(20, 'Tối đa 20 sở thích ăn uống')
            .optional(),
    })
    .refine(
        (data) =>
            data.displayName !== undefined ||
            data.preferredUnitSystem !== undefined ||
            data.dietaryPreferences !== undefined,
        {
            message: 'Phải cung cấp ít nhất một trường để cập nhật',
        }
    )

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

/**
 * Change Password schema
 */
export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Mật khẩu hiện tại không được để trống'),
        newPassword: passwordSchema,
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
        path: ['newPassword'],
    })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

/**
 * Request Password Reset schema
 */
export const requestPasswordResetSchema = z.object({
    email: emailSchema,
})

export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>

/**
 * Reset Password with Token schema
 */
export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token không hợp lệ'),
    newPassword: passwordSchema,
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

/**
 * Delete Account schema
 */
export const deleteAccountSchema = z.object({
    password: z.string().min(1, 'Mật khẩu không được để trống'),
    confirmation: z.literal('DELETE', {
        errorMap: () => ({ message: 'Vui lòng nhập DELETE để xác nhận' }),
    }),
})

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
