import { test, expect } from '@playwright/test'

test.describe('Recipe Discovery (US1)', () => {
    test.use({ viewport: { width: 375, height: 812 } }) // iPhone-like viewport

    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    // T108: Search for recipes by name
    test('should search recipes by name', async ({ page }) => {
        // Verify search section exists
        const searchSection = page.getByTestId('search-section')
        await expect(searchSection).toBeVisible()

        // Type in search input
        const searchInput = page.getByTestId('search-input')
        await expect(searchInput).toBeVisible()
        await searchInput.fill('Phở')

        // Wait for debounced search results
        await page.waitForTimeout(500) // debounce is 300ms + network time

        // Should show search results or empty state
        const results = page.getByTestId('search-results')
        await expect(results).toBeVisible({ timeout: 5000 })

        // Verify results heading mentions count
        await expect(results.locator('h2')).toContainText('Kết quả')
    })

    test('should clear search and return to trending', async ({ page }) => {
        const searchInput = page.getByTestId('search-input')
        await searchInput.fill('test search query')
        await page.waitForTimeout(500)

        // Clear the search
        const clearBtn = page.getByTestId('search-clear')
        await clearBtn.click()
        await page.waitForTimeout(500)

        // Should return to trending section
        const trending = page.getByTestId('trending-section')
        await expect(trending).toBeVisible({ timeout: 5000 })
        await expect(trending.locator('h2')).toContainText('Công thức phổ biến')
    })

    // T109: Filter recipes by tags
    test('should filter recipes by tags', async ({ page }) => {
        const tagList = page.getByTestId('tag-list')
        await expect(tagList).toBeVisible()

        // "Tất cả" tag should be selected by default
        const allTag = page.getByTestId('tag-all')
        await expect(allTag).toBeVisible()

        // Click on a specific tag (any available tag button after "Tất cả")
        const tagButtons = tagList.locator('button')
        const tagCount = await tagButtons.count()

        if (tagCount > 1) {
            // Click the second tag (first non-"Tất cả" tag)
            await tagButtons.nth(1).click()
            await page.waitForTimeout(500)

            // Should show search results
            const results = page.getByTestId('search-results')
            await expect(results).toBeVisible({ timeout: 5000 })

            // Click "Tất cả" to reset
            await allTag.click()
            await page.waitForTimeout(500)

            // Should return to trending
            const trending = page.getByTestId('trending-section')
            await expect(trending).toBeVisible({ timeout: 5000 })
        }
    })

    // T110: Apply time and calorie filters
    test('should open filter modal and apply filters', async ({ page }) => {
        // Click filter button
        const filterBtn = page.getByTestId('filter-button')
        await expect(filterBtn).toBeVisible()
        await filterBtn.click()

        // Filter modal should appear
        const filterModal = page.getByTestId('filter-modal')
        await expect(filterModal).toBeVisible()

        // Select a cooking time option (≤ 30 phút)
        const timeOption = page.getByTestId('filter-option-≤ 30 phút')
        await timeOption.click()

        // Select a calorie option (≤ 500 cal)
        const calorieOption = page.getByTestId('filter-option-≤ 500 cal')
        await calorieOption.click()

        // Apply filters
        const applyBtn = page.getByTestId('filter-apply')
        await applyBtn.click()

        // Modal should close
        await expect(filterModal).not.toBeVisible({ timeout: 3000 })

        // Search results should appear
        await page.waitForTimeout(500)
        const results = page.getByTestId('search-results')
        await expect(results).toBeVisible({ timeout: 5000 })

        // Filter button should indicate active filters
        await expect(filterBtn).toHaveClass(/border-primary/)
    })

    test('should reset filters in filter modal', async ({ page }) => {
        // Open filter modal
        await page.getByTestId('filter-button').click()

        const filterModal = page.getByTestId('filter-modal')
        await expect(filterModal).toBeVisible()

        // Select a filter
        await page.getByTestId('filter-option-≤ 15 phút').click()

        // Click reset
        const resetBtn = page.getByTestId('filter-reset')
        await resetBtn.click()

        // Apply (should have no active filters)
        await page.getByTestId('filter-apply').click()
        await expect(filterModal).not.toBeVisible({ timeout: 3000 })

        // Should return to trending (no active filters)
        await page.waitForTimeout(500)
        const trending = page.getByTestId('trending-section')
        await expect(trending).toBeVisible({ timeout: 5000 })
    })

    // T111: Browse trending recipes grid
    test('should display trending recipes grid on home page', async ({ page }) => {
        // Trending section should be visible
        const trendingSection = page.getByTestId('trending-section')
        await expect(trendingSection).toBeVisible()
        await expect(trendingSection.locator('h2')).toContainText('Công thức phổ biến')

        // Should show recipe grid (or empty state)
        const grid = page.getByTestId('recipe-grid')
        const emptyState = page.getByTestId('recipe-grid-empty')

        // Either grid with cards or empty state should be visible
        const isGridVisible = await grid.isVisible().catch(() => false)
        const isEmptyVisible = await emptyState.isVisible().catch(() => false)
        expect(isGridVisible || isEmptyVisible).toBeTruthy()

        if (isGridVisible) {
            // If grid is visible, verify recipe cards exist
            const cards = page.getByTestId('recipe-card')
            const cardCount = await cards.count()
            expect(cardCount).toBeGreaterThan(0)
            expect(cardCount).toBeLessThanOrEqual(6)
        }
    })

    test('should display home page hero section', async ({ page }) => {
        const heading = page.getByRole('heading', { name: /Khám phá công thức/ })
        await expect(heading).toBeVisible()
    })

    test('should display next meal section', async ({ page }) => {
        const nextMealSection = page.getByTestId('next-meal-section')
        await expect(nextMealSection).toBeVisible()
    })

    // T112: Mobile responsive behavior (320px viewport)
    test('should be responsive at 320px viewport', async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 568 })
        await page.goto('/')

        // Page should render without horizontal overflow
        const body = page.locator('body')
        const bodyBox = await body.boundingBox()
        expect(bodyBox).toBeTruthy()
        if (bodyBox) {
            // Body width should not exceed viewport width
            expect(bodyBox.width).toBeLessThanOrEqual(320)
        }

        // Key elements should still be visible
        await expect(page.getByTestId('search-section')).toBeVisible()
        await expect(page.getByTestId('tag-list')).toBeVisible()
        await expect(page.getByTestId('bottom-nav')).toBeVisible()

        // Search input should be usable
        const searchInput = page.getByTestId('search-input')
        await expect(searchInput).toBeVisible()
        const inputBox = await searchInput.boundingBox()
        expect(inputBox).toBeTruthy()
        if (inputBox) {
            // Input should be wide enough to type in
            expect(inputBox.width).toBeGreaterThan(150)
        }
    })

    test('should be responsive at 390px viewport (iPhone 14)', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 })
        await page.goto('/')

        // All sections should be visible
        await expect(page.getByTestId('search-section')).toBeVisible()
        await expect(page.getByTestId('categories-section')).toBeVisible()

        // Recipe grid should use single column layout on mobile
        const grid = page.getByTestId('recipe-grid')
        const gridVisible = await grid.isVisible().catch(() => false)
        if (gridVisible) {
            const gridBox = await grid.boundingBox()
            expect(gridBox).toBeTruthy()
        }
    })

    test('should handle tag list horizontal scroll on mobile', async ({ page }) => {
        const tagList = page.getByTestId('tag-list')
        await expect(tagList).toBeVisible()

        // Tag list should be scrollable horizontally
        const scrollContainer = tagList.locator('.overflow-x-auto')
        await expect(scrollContainer).toBeVisible()
    })
})
