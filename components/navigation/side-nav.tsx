'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, isNavItemActive } from './nav-items'
import { useGroceryBadge } from '@/hooks/use-grocery-badge'

/**
 * Sidebar navigation for tablet/desktop viewports (md+).
 * Hidden on mobile where BottomNav is used instead.
 */
export function SideNav() {
    const pathname = usePathname()
    const { count: groceryCount } = useGroceryBadge()

    return (
        <aside
            className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-64 md:flex-col"
            role="navigation"
            aria-label="Menu chính"
            data-testid="side-nav"
        >
            <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-background px-6 pb-4">
                {/* Logo / App Name */}
                <div className="flex h-16 shrink-0 items-center gap-2">
                    <span className="text-2xl">🍳</span>
                    <span className="text-lg font-bold text-primary">Recipe Planner</span>
                </div>

                {/* Navigation Items */}
                <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = isNavItemActive(pathname, item.href)
                            const Icon = isActive ? item.activeIcon : item.icon
                            const badgeCount = item.hasBadge ? groceryCount : 0

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                                            isActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                        )}
                                        aria-current={isActive ? 'page' : undefined}
                                        data-testid={`${item.testId}-side`}
                                    >
                                        <Icon
                                            size={20}
                                            className={cn(
                                                'h-5 w-5 shrink-0',
                                                isActive
                                                    ? 'text-primary'
                                                    : 'text-muted-foreground group-hover:text-foreground'
                                            )}
                                        />
                                        <span className="flex-1">{item.label}</span>
                                        {badgeCount > 0 && (
                                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                                                {badgeCount > 99 ? '99+' : badgeCount}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </div>
        </aside>
    )
}
