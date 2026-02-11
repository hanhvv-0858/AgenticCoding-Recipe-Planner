'use client'

import { usePathname } from 'next/navigation'
import { NAV_ITEMS, isNavItemActive } from './nav-items'

/**
 * Mobile-only header showing the current section name.
 * Hidden on desktop where the sidebar provides context.
 */
export function MobileHeader() {
    const pathname = usePathname()

    // Find the active nav item to show its label
    const activeItem = NAV_ITEMS.find((item) =>
        isNavItemActive(pathname, item.href)
    )

    const title = activeItem?.label ?? 'Recipe Planner'

    return (
        <header
            className="fixed inset-x-0 top-0 z-30 flex h-14 items-center border-b border-border/40 bg-background/95 px-4 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/80 md:hidden"
            data-testid="mobile-header"
        >
            <div className="flex flex-1 items-center gap-2">
                <span className="text-lg">🍳</span>
                <h1 className="text-base font-semibold text-foreground">{title}</h1>
            </div>
        </header>
    )
}
