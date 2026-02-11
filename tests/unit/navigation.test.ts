import { isNavItemActive, NAV_ITEMS } from '@/components/navigation/nav-items'

describe('isNavItemActive', () => {
    test('root path "/" matches only exact "/"', () => {
        expect(isNavItemActive('/', '/')).toBe(true)
        expect(isNavItemActive('/cookbook', '/')).toBe(false)
        expect(isNavItemActive('/planner', '/')).toBe(false)
    })

    test('non-root paths match exactly', () => {
        expect(isNavItemActive('/cookbook', '/cookbook')).toBe(true)
        expect(isNavItemActive('/planner', '/planner')).toBe(true)
        expect(isNavItemActive('/grocery', '/grocery')).toBe(true)
        expect(isNavItemActive('/profile', '/profile')).toBe(true)
    })

    test('non-root paths match sub-paths (prefix)', () => {
        expect(isNavItemActive('/cookbook/123', '/cookbook')).toBe(true)
        expect(isNavItemActive('/cookbook/recipe/456', '/cookbook')).toBe(true)
        expect(isNavItemActive('/planner/week/2026-02', '/planner')).toBe(true)
    })

    test('does not match unrelated paths', () => {
        expect(isNavItemActive('/cookbook', '/planner')).toBe(false)
        expect(isNavItemActive('/grocery', '/profile')).toBe(false)
        expect(isNavItemActive('/cookbookx', '/cookbook')).toBe(false)
    })
})

describe('NAV_ITEMS', () => {
    test('contains exactly 5 navigation items', () => {
        expect(NAV_ITEMS).toHaveLength(5)
    })

    test('all items have required props', () => {
        for (const item of NAV_ITEMS) {
            expect(item.href).toBeTruthy()
            expect(item.label).toBeTruthy()
            expect(item.icon).toBeDefined()
            expect(item.activeIcon).toBeDefined()
            expect(item.testId).toBeTruthy()
        }
    })

    test('items are in correct order: Home, Cookbook, Planner, Grocery, Profile', () => {
        expect(NAV_ITEMS[0].href).toBe('/')
        expect(NAV_ITEMS[1].href).toBe('/cookbook')
        expect(NAV_ITEMS[2].href).toBe('/planner')
        expect(NAV_ITEMS[3].href).toBe('/grocery')
        expect(NAV_ITEMS[4].href).toBe('/profile')
    })

    test('only grocery item has badge support', () => {
        const badgeItems = NAV_ITEMS.filter((item) => item.hasBadge)
        expect(badgeItems).toHaveLength(1)
        expect(badgeItems[0].href).toBe('/grocery')
    })

    test('labels are in Vietnamese', () => {
        expect(NAV_ITEMS[0].label).toBe('Trang chủ')
        expect(NAV_ITEMS[1].label).toBe('Sổ tay')
        expect(NAV_ITEMS[2].label).toBe('Lập kế hoạch')
        expect(NAV_ITEMS[3].label).toBe('Mua sắm')
        expect(NAV_ITEMS[4].label).toBe('Cá nhân')
    })

    test('test IDs follow consistent pattern', () => {
        for (const item of NAV_ITEMS) {
            expect(item.testId).toMatch(/^nav-/)
        }
    })
})
