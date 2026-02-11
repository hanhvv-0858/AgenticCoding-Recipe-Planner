'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChangePasswordModal } from '@/components/auth'
import { useUser } from '@/hooks/use-user'
import { signOut, updateUserProfile } from '@/lib/actions/auth'
import { ProfileSkeleton } from '@/components/ui/skeleton'
import { displayNameSchema } from '@/lib/schemas/common'
import Link from 'next/link'

export default function ProfilePage() {
    const { user, isLoading, isAuthenticated, refresh } = useUser()
    const [isEditing, setIsEditing] = React.useState(false)
    const [displayName, setDisplayName] = React.useState('')
    const [isSaving, setIsSaving] = React.useState(false)
    const [isSigningOut, setIsSigningOut] = React.useState(false)
    const [showChangePassword, setShowChangePassword] = React.useState(false)
    const [saveMessage, setSaveMessage] = React.useState<string | null>(null)

    React.useEffect(() => {
        if (user?.displayName) {
            setDisplayName(user.displayName)
        }
    }, [user?.displayName])

    const handleSaveDisplayName = async () => {
        setSaveMessage(null)

        // Client-side validation
        const validation = displayNameSchema.safeParse(displayName)
        if (!validation.success) {
            setSaveMessage(validation.error.errors[0]?.message ?? 'Tên hiển thị không hợp lệ')
            return
        }

        setIsSaving(true)
        try {
            const result = await updateUserProfile({ displayName })
            if (result.error) {
                setSaveMessage(result.error.message)
            } else {
                setSaveMessage('Đã cập nhật thành công!')
                setIsEditing(false)
                refresh()
                setTimeout(() => setSaveMessage(null), 3000)
            }
        } catch {
            setSaveMessage('Đã xảy ra lỗi.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleSignOut = async () => {
        setIsSigningOut(true)
        try {
            await signOut()
        } catch (err) {
            if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
                throw err
            }
            setIsSigningOut(false)
        }
    }

    if (isLoading) {
        return <ProfileSkeleton />
    }

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-6">
                <section className="mb-8">
                    <h1 className="mb-2 text-2xl font-bold text-foreground xs:text-3xl">
                        Trang cá nhân 👤
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Quản lý tài khoản và cài đặt
                    </p>
                </section>

                <section className="mb-6" data-testid="profile-card">
                    <Card>
                        <CardContent className="flex flex-col items-center gap-4 p-6">
                            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-2xl">
                                👤
                            </div>
                            <p className="text-center text-sm text-muted-foreground">
                                Đăng nhập để lưu công thức và tạo kế hoạch bữa ăn
                            </p>
                            <div className="flex gap-2">
                                <Link href="/login">
                                    <Button variant="primary" size="sm">
                                        Đăng nhập
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button variant="outline" size="sm">
                                        Đăng ký
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <section className="mb-8">
                <h1 className="mb-2 text-2xl font-bold text-foreground xs:text-3xl">
                    Trang cá nhân 👤
                </h1>
                <p className="text-sm text-muted-foreground">
                    Quản lý tài khoản và cài đặt
                </p>
            </section>

            {/* Profile Card */}
            <section className="mb-6" data-testid="profile-card">
                <Card>
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl">
                            {user?.displayName?.[0]?.toUpperCase() || '👤'}
                        </div>
                        <div className="min-w-0 flex-1">
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Nhập tên hiển thị"
                                        className="h-8 text-sm"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleSaveDisplayName}
                                        isLoading={isSaving}
                                    >
                                        Lưu
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setIsEditing(false)
                                            setDisplayName(user?.displayName || '')
                                        }}
                                    >
                                        Hủy
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        <h2 className="truncate font-semibold">
                                            {user?.displayName || 'Người dùng'}
                                        </h2>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="text-xs text-primary hover:underline"
                                            data-testid="edit-name-button"
                                        >
                                            Sửa
                                        </button>
                                    </div>
                                    <p className="truncate text-sm text-muted-foreground">
                                        {user?.email}
                                    </p>
                                </>
                            )}
                            {saveMessage && (
                                <p className="mt-1 text-xs text-green-600">{saveMessage}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Settings */}
            <section data-testid="profile-settings" className="mb-6">
                <h2 className="mb-3 text-lg font-semibold">Cài đặt</h2>
                <div className="space-y-2">
                    {[
                        { icon: '🔔', label: 'Thông báo', desc: 'Nhắc nhở bữa ăn' },
                        { icon: '📏', label: 'Đơn vị đo', desc: user?.preferredUnitSystem === 'imperial' ? 'Imperial' : 'Hệ mét' },
                        { icon: '🍽️', label: 'Chế độ ăn', desc: user?.dietaryPreferences?.length ? user.dietaryPreferences.join(', ') : 'Chưa thiết lập' },
                        { icon: 'ℹ️', label: 'Về ứng dụng', desc: 'Phiên bản 1.0.0' },
                    ].map((setting) => (
                        <Card key={setting.label} className="cursor-pointer transition-colors hover:bg-accent/50">
                            <CardHeader className="p-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{setting.icon}</span>
                                    <div className="flex-1">
                                        <CardTitle className="text-sm font-medium">
                                            {setting.label}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            {setting.desc}
                                        </p>
                                    </div>
                                    <span className="text-muted-foreground">→</span>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Account Actions */}
            <section data-testid="account-actions">
                <h2 className="mb-3 text-lg font-semibold">Tài khoản</h2>
                <div className="space-y-2">
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setShowChangePassword(true)}
                        data-testid="change-password-button"
                    >
                        🔒 Đổi mật khẩu
                    </Button>
                    <Button
                        variant="destructive"
                        className="w-full justify-start"
                        onClick={handleSignOut}
                        isLoading={isSigningOut}
                        data-testid="sign-out-button"
                    >
                        🚪 Đăng xuất
                    </Button>
                </div>
            </section>

            {/* Change Password Modal */}
            <ChangePasswordModal
                isOpen={showChangePassword}
                onClose={() => setShowChangePassword(false)}
            />
        </div>
    )
}
