import { test, expect } from '@playwright/test'

test.describe('Personal Cookbook (US6 - Phase 7)', () => {
    test.use({ viewport: { width: 375, height: 812 } })

    // T151: Save recipe from detail page
    test('should show save button on recipe detail page', async ({ page }) => {
        await page.goto('/')

        const recipeCard = page.getByTestId('recipe-card').first()
        await expect(recipeCard).toBeVisible({ timeout: 10000 })
        await recipeCard.click()

        await expect(page.getByTestId('recipe-detail')).toBeVisible({ timeout: 10000 })

        // Save button should be present
        const saveButton = page.getByTestId('save-button')
        await expect(saveButton).toBeVisible()
        await expect(saveButton).toContainText('Lưu lại')
    })

    // T152: View saved recipes in Cookbook section
    test('should navigate to cookbook page', async ({ page }) => {
        await page.goto('/cookbook')

        // Cookbook page content should load
        const cookbookContent = page.getByTestId('cookbook-content')
        await expect(cookbookContent).toBeVisible({ timeout: 10000 })
    })

    // T152: Cookbook shows empty state when not logged in or no saved recipes
    test('should show empty or login state in cookbook', async ({ page }) => {
        await page.goto('/cookbook')

        // Should show either login prompt or empty state
        await expect(
            page.getByText(/Chưa có công thức nào|Đăng nhập để xem sổ tay/)
        ).toBeVisible({ timeout: 10000 })
    })

    // T153: Cookbook header is displayed
    test('should display cookbook header', async ({ page }) => {
        await page.goto('/cookbook')

        await expect(page.getByText('Sổ tay công thức 📖')).toBeVisible({ timeout: 10000 })
    })

    // T154: Action buttons visible on recipe detail
    test('should show action buttons including save and add to plan', async ({ page }) => {
        await page.goto('/')

        const recipeCard = page.getByTestId('recipe-card').first()
        await expect(recipeCard).toBeVisible({ timeout: 10000 })
        await recipeCard.click()

        await expect(page.getByTestId('recipe-detail')).toBeVisible({ timeout: 10000 })

        const actionButtons = page.getByTestId('action-buttons')
        await expect(actionButtons).toBeVisible()

        // Both save and plan buttons should exist
        await expect(page.getByTestId('save-button')).toBeVisible()
        await expect(page.getByTestId('add-to-plan-button')).toBeVisible()
    })
})
