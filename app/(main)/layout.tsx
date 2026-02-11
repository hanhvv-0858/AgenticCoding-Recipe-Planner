import { BottomNav } from '@/components/navigation/bottom-nav'
import { SideNav } from '@/components/navigation/side-nav'
import { MobileHeader } from '@/components/navigation/mobile-header'

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {/* T240: Skip to main content link for keyboard users */}
            <a
                href="#main-content"
                className="fixed left-2 top-2 z-[100] -translate-y-16 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring"
            >
                Chuyển đến nội dung chính
            </a>

            {/* Desktop Sidebar Navigation (md+) */}
            <SideNav />

            {/* Mobile Header */}
            <MobileHeader />

            {/* Main Content - offset for sidebar on desktop, bottom nav on mobile */}
            <main
                id="main-content"
                className="min-h-screen pb-20 pt-14 md:py-0 md:pl-64"
                role="main"
            >
                {children}
            </main>

            {/* Bottom Navigation (Mobile Only) */}
            <BottomNav />
        </>
    )
}
