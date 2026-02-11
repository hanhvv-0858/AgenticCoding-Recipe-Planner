import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'
import { OfflineBanner } from '@/components/ui/offline-banner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Recipe Planner',
    description: 'Lên thực đơn & danh sách mua sắm',
    manifest: '/manifest.json',
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#22c55e',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="vi">
            <body className={inter.className}>
                <ToastProvider>
                    <OfflineBanner />
                    {children}
                </ToastProvider>
            </body>
        </html>
    )
}
