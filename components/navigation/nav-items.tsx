'use client'

import * as React from 'react'
import {
    HomeIcon,
    HomeFilledIcon,
    CookbookIcon,
    CookbookFilledIcon,
    PlannerIcon,
    PlannerFilledIcon,
    GroceryIcon,
    GroceryFilledIcon,
    ProfileIcon,
    ProfileFilledIcon,
} from '@/components/icons'

export interface NavItemConfig {
    /** Route path */
    href: string
    /** Display label */
    label: string
    /** Icon component for inactive state */
    icon: React.ComponentType<{ size?: number; className?: string }>
    /** Icon component for active state (filled variant) */
    activeIcon: React.ComponentType<{ size?: number; className?: string }>
    /** Whether this item supports a dynamic badge (e.g., grocery count) */
    hasBadge?: boolean
    /** Test ID for E2E testing */
    testId: string
}

export const NAV_ITEMS: NavItemConfig[] = [
    {
        href: '/',
        label: 'Trang chủ',
        icon: HomeIcon,
        activeIcon: HomeFilledIcon,
        testId: 'nav-home',
    },
    {
        href: '/cookbook',
        label: 'Sổ tay',
        icon: CookbookIcon,
        activeIcon: CookbookFilledIcon,
        testId: 'nav-cookbook',
    },
    {
        href: '/planner',
        label: 'Lập kế hoạch',
        icon: PlannerIcon,
        activeIcon: PlannerFilledIcon,
        testId: 'nav-planner',
    },
    {
        href: '/grocery',
        label: 'Mua sắm',
        icon: GroceryIcon,
        activeIcon: GroceryFilledIcon,
        hasBadge: true,
        testId: 'nav-grocery',
    },
    {
        href: '/profile',
        label: 'Cá nhân',
        icon: ProfileIcon,
        activeIcon: ProfileFilledIcon,
        testId: 'nav-profile',
    },
]

/**
 * Check if a given pathname matches a nav item's href.
 * For the root path "/", exact match is required.
 * For other paths, prefix matching is used (e.g., "/cookbook/123" matches "/cookbook").
 */
export function isNavItemActive(pathname: string, href: string): boolean {
    if (href === '/') {
        return pathname === '/'
    }
    return pathname === href || pathname.startsWith(`${href}/`)
}
