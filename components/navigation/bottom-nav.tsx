'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, isNavItemActive } from './nav-items'
import { useGroceryBadge } from '@/hooks/use-grocery-badge'

function NavBadge({ count }: { count: number }) {
    if (count <= 0) return null

    return (
        <span
            className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground"
            aria-label={`${count} mục chưa mua`}
        >
            {count > 99 ? '99+' : count}
        </span>
    )
}

export function BottomNav() {
    const pathname = usePathname()
    const { count: groceryCount } = useGroceryBadge()

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border/40 bg-background/95 shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-background/80 md:hidden"
            role="navigation"
            aria-label="Menu chính"
            data-testid="bottom-nav"
        >
            {/* Safe area padding for devices with home indicator (iPhone notch) */}
            <div className="flex h-16 items-center justify-around pb-safe">
                {NAV_ITEMS.map((item) => {
                    const isActive = isNavItemActive(pathname, item.href)
                    const Icon = isActive ? item.activeIcon : item.icon
                    const badgeCount = item.hasBadge ? groceryCount : 0

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5',
                                'transition-all duration-200 ease-in-out',
                                'active:scale-95',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                                isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                            aria-current={isActive ? 'page' : undefined}
                            data-testid={item.testId}
                        >
                            <div className="relative">
                                <Icon size={24} className="size-6" />
                                <NavBadge count={badgeCount} />
                            </div>
                            <span
                                className={cn(
                                    'text-[10px] leading-tight',
                                    isActive ? 'font-semibold' : 'font-medium'
                                )}
                            >
                                {item.label}
                            </span>
                            {/* Active indicator dot */}
                            {isActive && (
                                <span className="absolute bottom-0 h-0.5 w-4 rounded-full bg-primary" />
                            )}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
