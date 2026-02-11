/**
 * Authentication Integration Tests
 * Tests validation schemas, input sanitization, and auth logic
 */

import {
    signUpSchema,
    signInSchema,
    updateProfileSchema,
    changePasswordSchema,
} from '@/lib/validations/auth'

describe('Auth Validation Schemas', () => {
    describe('signUpSchema', () => {
        it('should accept valid sign up data', () => {
            const result = signUpSchema.safeParse({
                email: 'test@example.com',
                password: 'Password1',
                displayName: 'Test User',
            })
            expect(result.success).toBe(true)
        })

        it('should accept sign up without displayName', () => {
            const result = signUpSchema.safeParse({
                email: 'test@example.com',
                password: 'Password1',
            })
            expect(result.success).toBe(true)
        })

        it('should reject invalid email', () => {
            const result = signUpSchema.safeParse({
                email: 'not-an-email',
                password: 'Password1',
            })
            expect(result.success).toBe(false)
        })

        it('should reject short password', () => {
            const result = signUpSchema.safeParse({
                email: 'test@example.com',
                password: 'short',
            })
            expect(result.success).toBe(false)
        })

        it('should reject password without uppercase', () => {
            const result = signUpSchema.safeParse({
                email: 'test@example.com',
                password: 'password1',
            })
            expect(result.success).toBe(false)
        })

        it('should reject password without number', () => {
            const result = signUpSchema.safeParse({
                email: 'test@example.com',
                password: 'Password',
            })
            expect(result.success).toBe(false)
        })

        it('should reject password without lowercase', () => {
            const result = signUpSchema.safeParse({
                email: 'test@example.com',
                password: 'PASSWORD1',
            })
            expect(result.success).toBe(false)
        })
    })

    describe('signInSchema', () => {
        it('should accept valid sign in data', () => {
            const result = signInSchema.safeParse({
                email: 'test@example.com',
                password: 'any-password',
            })
            expect(result.success).toBe(true)
        })

        it('should reject empty password', () => {
            const result = signInSchema.safeParse({
                email: 'test@example.com',
                password: '',
            })
            expect(result.success).toBe(false)
        })

        it('should reject invalid email', () => {
            const result = signInSchema.safeParse({
                email: 'bad-email',
                password: 'password',
            })
            expect(result.success).toBe(false)
        })
    })

    describe('updateProfileSchema', () => {
        it('should accept valid display name update', () => {
            const result = updateProfileSchema.safeParse({
                displayName: 'New Name',
            })
            expect(result.success).toBe(true)
        })

        it('should accept valid unit system update', () => {
            const result = updateProfileSchema.safeParse({
                preferredUnitSystem: 'imperial',
            })
            expect(result.success).toBe(true)
        })

        it('should accept valid dietary preferences update', () => {
            const result = updateProfileSchema.safeParse({
                dietaryPreferences: ['vegetarian', 'gluten-free'],
            })
            expect(result.success).toBe(true)
        })

        it('should reject empty update (no fields)', () => {
            const result = updateProfileSchema.safeParse({})
            expect(result.success).toBe(false)
        })

        it('should reject invalid unit system', () => {
            const result = updateProfileSchema.safeParse({
                preferredUnitSystem: 'invalid',
            })
            expect(result.success).toBe(false)
        })

        it('should reject too many dietary preferences', () => {
            const prefs = Array.from({ length: 21 }, (_, i) => `pref-${i}`)
            const result = updateProfileSchema.safeParse({
                dietaryPreferences: prefs,
            })
            expect(result.success).toBe(false)
        })

        it('should reject dietary preference too long', () => {
            const result = updateProfileSchema.safeParse({
                dietaryPreferences: ['a'.repeat(51)],
            })
            expect(result.success).toBe(false)
        })
    })

    describe('changePasswordSchema', () => {
        it('should accept valid password change', () => {
            const result = changePasswordSchema.safeParse({
                currentPassword: 'OldPassword1',
                newPassword: 'NewPassword2',
            })
            expect(result.success).toBe(true)
        })

        it('should reject empty current password', () => {
            const result = changePasswordSchema.safeParse({
                currentPassword: '',
                newPassword: 'NewPassword2',
            })
            expect(result.success).toBe(false)
        })

        it('should reject weak new password', () => {
            const result = changePasswordSchema.safeParse({
                currentPassword: 'OldPassword1',
                newPassword: 'weak',
            })
            expect(result.success).toBe(false)
        })

        it('should reject same password', () => {
            const result = changePasswordSchema.safeParse({
                currentPassword: 'SamePassword1',
                newPassword: 'SamePassword1',
            })
            expect(result.success).toBe(false)
            if (!result.success) {
                const paths = result.error.errors.map((e) => e.path.join('.'))
                expect(paths).toContain('newPassword')
            }
        })
    })
})
