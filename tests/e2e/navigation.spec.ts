import { test, expect } from '@playwright/test'

test.describe('Navigation - Bottom Nav (Mobile)', () => {
    test.use({ viewport: { width: 375, height: 812 } }) // iPhone-like viewport

    test('should display bottom navigation bar with 5 items', async ({
        page,
    }) => {
        await page.goto('/')
        const bottomNav = page.getByTestId('bottom-nav')
        await expect(bottomNav).toBeVisible()

        // Verify all 5 nav items exist
        await expect(page.getByTestId('nav-home')).toBeVisible()
        await expect(page.getByTestId('nav-cookbook')).toBeVisible()
        await expect(page.getByTestId('nav-planner')).toBeVisible()
        await expect(page.getByTestId('nav-grocery')).toBeVisible()
        await expect(page.getByTestId('nav-profile')).toBeVisible()
    })

    test('should display mobile header with current section name', async ({
        page,
    }) => {
        await page.goto('/')
        const header = page.getByTestId('mobile-header')
        await expect(header).toBeVisible()
        await expect(header).toContainText('Trang chủ')
    })

    test('should navigate to Home page when Home icon is tapped', async ({
        page,
    }) => {
        await page.goto('/cookbook')
        await page.getByTestId('nav-home').click()
        await expect(page).toHaveURL('/')
        // Verify correct page content loaded
        await expect(
            page.getByRole('heading', { name: /Khám phá công thức/ })
        ).toBeVisible()
    })

    test('should navigate to Cookbook page when Cookbook icon is tapped', async ({
        page,
    }) => {
        await page.goto('/')
        await page.getByTestId('nav-cookbook').click()
        await expect(page).toHaveURL('/cookbook')
        await expect(
            page.getByRole('heading', { name: /Sổ tay công thức/ })
        ).toBeVisible()
    })

    test('should navigate to Planner page when Planner icon is tapped', async ({
        page,
    }) => {
        await page.goto('/')
        await page.getByTestId('nav-planner').click()
        await expect(page).toHaveURL('/planner')
        await expect(
            page.getByRole('heading', { name: /Lập kế hoạch bữa ăn/ })
        ).toBeVisible()
    })

    test('should navigate to Grocery page when Grocery icon is tapped', async ({
        page,
    }) => {
        await page.goto('/')
        await page.getByTestId('nav-grocery').click()
        await expect(page).toHaveURL('/grocery')
        await expect(
            page.getByRole('heading', { name: /Danh sách mua sắm/ })
        ).toBeVisible()
    })

    test('should navigate to Profile page when Profile icon is tapped', async ({
        page,
    }) => {
        await page.goto('/')
        await page.getByTestId('nav-profile').click()
        await expect(page).toHaveURL('/profile')
        await expect(
            page.getByRole('heading', { name: /Trang cá nhân/ })
        ).toBeVisible()
    })

    test('should highlight the active navigation item', async ({ page }) => {
        // Go to home - Home should be active
        await page.goto('/')
        const homeLink = page.getByTestId('nav-home')
        await expect(homeLink).toHaveAttribute('aria-current', 'page')

        // Other nav items should NOT have aria-current
        const cookbookLink = page.getByTestId('nav-cookbook')
        await expect(cookbookLink).not.toHaveAttribute('aria-current', 'page')

        // Navigate to Cookbook
        await cookbookLink.click()
        await expect(page).toHaveURL('/cookbook')

        // Cookbook should now be active
        await expect(page.getByTestId('nav-cookbook')).toHaveAttribute(
            'aria-current',
            'page'
        )
        // Home should no longer be active
        await expect(page.getByTestId('nav-home')).not.toHaveAttribute(
            'aria-current',
            'page'
        )
    })

    test('should update active state when navigating through all sections', async ({
        page,
    }) => {
        const navItems = [
            { testId: 'nav-home', url: '/' },
            { testId: 'nav-cookbook', url: '/cookbook' },
            { testId: 'nav-planner', url: '/planner' },
            { testId: 'nav-grocery', url: '/grocery' },
            { testId: 'nav-profile', url: '/profile' },
        ]

        for (const item of navItems) {
            await page.goto(item.url)
            const activeItem = page.getByTestId(item.testId)
            await expect(activeItem).toHaveAttribute('aria-current', 'page')

            // All other items should not be active
            for (const otherItem of navItems) {
                if (otherItem.testId !== item.testId) {
                    await expect(
                        page.getByTestId(otherItem.testId)
                    ).not.toHaveAttribute('aria-current', 'page')
                }
            }
        }
    })

    test('should update mobile header when navigating between sections', async ({
        page,
    }) => {
        const sections = [
            { testId: 'nav-home', header: 'Trang chủ' },
            { testId: 'nav-cookbook', header: 'Sổ tay' },
            { testId: 'nav-planner', header: 'Lập kế hoạch' },
            { testId: 'nav-grocery', header: 'Mua sắm' },
            { testId: 'nav-profile', header: 'Cá nhân' },
        ]

        await page.goto('/')

        for (const section of sections) {
            await page.getByTestId(section.testId).click()
            const header = page.getByTestId('mobile-header')
            await expect(header).toContainText(section.header)
        }
    })

    test('should have touch-friendly navigation targets (min 44x44px)', async ({
        page,
    }) => {
        await page.goto('/')

        const navItems = [
            'nav-home',
            'nav-cookbook',
            'nav-planner',
            'nav-grocery',
            'nav-profile',
        ]

        for (const testId of navItems) {
            const element = page.getByTestId(testId)
            const box = await element.boundingBox()
            expect(box).toBeTruthy()
            expect(box!.width).toBeGreaterThanOrEqual(44)
            expect(box!.height).toBeGreaterThanOrEqual(44)
        }
    })

    test('should have proper accessibility labels', async ({ page }) => {
        await page.goto('/')
        const nav = page.getByTestId('bottom-nav')
        await expect(nav).toHaveAttribute('aria-label', 'Menu chính')
        await expect(nav).toHaveAttribute('role', 'navigation')
    })
})

test.describe('Navigation - Sidebar (Desktop)', () => {
    test.use({ viewport: { width: 1280, height: 800 } })

    test('should display sidebar navigation on desktop', async ({ page }) => {
        await page.goto('/')
        const sideNav = page.getByTestId('side-nav')
        await expect(sideNav).toBeVisible()
    })

    test('should hide bottom nav on desktop', async ({ page }) => {
        await page.goto('/')
        const bottomNav = page.getByTestId('bottom-nav')
        await expect(bottomNav).toBeHidden()
    })

    test('should hide mobile header on desktop', async ({ page }) => {
        await page.goto('/')
        const header = page.getByTestId('mobile-header')
        await expect(header).toBeHidden()
    })

    test('should show app name in sidebar', async ({ page }) => {
        await page.goto('/')
        const sideNav = page.getByTestId('side-nav')
        await expect(sideNav).toContainText('Recipe Planner')
    })

    test('should navigate using sidebar links', async ({ page }) => {
        await page.goto('/')

        await page.getByTestId('nav-cookbook-side').click()
        await expect(page).toHaveURL('/cookbook')

        await page.getByTestId('nav-planner-side').click()
        await expect(page).toHaveURL('/planner')

        await page.getByTestId('nav-grocery-side').click()
        await expect(page).toHaveURL('/grocery')

        await page.getByTestId('nav-profile-side').click()
        await expect(page).toHaveURL('/profile')

        await page.getByTestId('nav-home-side').click()
        await expect(page).toHaveURL('/')
    })

    test('should highlight active sidebar item', async ({ page }) => {
        await page.goto('/cookbook')
        const cookbookLink = page.getByTestId('nav-cookbook-side')
        await expect(cookbookLink).toHaveAttribute('aria-current', 'page')
    })
})

test.describe('Navigation - Responsive Switching', () => {
    test('should switch between sidebar and bottom nav on viewport change', async ({
        page,
    }) => {
        // Start at desktop size
        await page.setViewportSize({ width: 1280, height: 800 })
        await page.goto('/')

        await expect(page.getByTestId('side-nav')).toBeVisible()
        await expect(page.getByTestId('bottom-nav')).toBeHidden()

        // Resize to mobile
        await page.setViewportSize({ width: 375, height: 812 })

        await expect(page.getByTestId('bottom-nav')).toBeVisible()
        await expect(page.getByTestId('side-nav')).toBeHidden()
    })
})
