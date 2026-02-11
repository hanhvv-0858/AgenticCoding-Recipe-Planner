'use client'

import * as React from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { changePassword } from '@/lib/actions/auth'
import { changePasswordSchema } from '@/lib/validations/auth'
import { extractFieldErrors } from '@/lib/utils/validation'
import type { ChangePasswordResult } from '@/types/auth'

interface ChangePasswordModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})
    const [success, setSuccess] = React.useState(false)
    const formRef = React.useRef<HTMLFormElement>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setFieldErrors({})
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const currentPassword = formData.get('currentPassword') as string
        const newPassword = formData.get('newPassword') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (newPassword !== confirmPassword) {
            setFieldErrors({ confirmPassword: 'Mật khẩu mới và xác nhận mật khẩu không khớp.' })
            setIsLoading(false)
            return
        }

        // Client-side Zod validation
        const validation = changePasswordSchema.safeParse({ currentPassword, newPassword })
        if (!validation.success) {
            setFieldErrors(extractFieldErrors(validation.error))
            setIsLoading(false)
            return
        }

        try {
            const result: ChangePasswordResult = await changePassword({
                currentPassword,
                newPassword,
            })

            if (result.error) {
                setError(result.error.message)
            } else {
                setSuccess(true)
                formRef.current?.reset()
                setTimeout(() => {
                    setSuccess(false)
                    onClose()
                }, 2000)
            }
        } catch {
            setError('Đã xảy ra lỗi. Vui lòng thử lại.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setError(null)
        setFieldErrors({})
        setSuccess(false)
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Đổi mật khẩu" size="sm">
            {success ? (
                <div className="rounded-md border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-700">
                    Đổi mật khẩu thành công!
                </div>
            ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div
                            className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    <Input
                        label="Mật khẩu hiện tại"
                        name="currentPassword"
                        type="password"
                        required
                        autoComplete="current-password"
                        placeholder="Nhập mật khẩu hiện tại"
                        error={fieldErrors.currentPassword}
                    />

                    <Input
                        label="Mật khẩu mới"
                        name="newPassword"
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="Ít nhất 8 ký tự, gồm chữ hoa, thường, số"
                        error={fieldErrors.newPassword}
                    />

                    <Input
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="Nhập lại mật khẩu mới"
                        error={fieldErrors.confirmPassword}
                    />

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="flex-1"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            isLoading={isLoading}
                        >
                            Đổi mật khẩu
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    )
}
