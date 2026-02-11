import { test, expect } from '@playwright/test'

test.describe('Recipe Detail (US2 - Phase 6)', () => {
    test.use({ viewport: { width: 375, height: 812 } }) // Mobile viewport

    // T132: Navigate to recipe detail from home
    test('should navigate to recipe detail page from recipe card', async ({ page }) => {
        await page.goto('/')

        // Wait for recipe cards to load
        const recipeCard = page.getByTestId('recipe-card').first()
        await expect(recipeCard).toBeVisible({ timeout: 10000 })

        // Click on the first recipe card
        await recipeCard.click()

        // Should navigate to recipe detail page
        await expect(page).toHaveURL(/\/recipes\/[a-zA-Z0-9-]+/)

        // Recipe detail page should be visible
        const recipeDetail = page.getByTestId('recipe-detail')
        await expect(recipeDetail).toBeVisible({ timeout: 10000 })
    })

    // T133: View recipe header with image and title
    test('should display recipe header with image and back button', async ({ page }) => {
        await page.goto('/')

        const recipeCard = page.getByTestId('recipe-card').first()
        await expect(recipeCard).toBeVisible({ timeout: 10000 })
        await recipeCard.click()

        await expect(page.getByTestId('recipe-detail')).toBeVisible({ timeout: 10000 })

        // Recipe header should show
        const header = page.getByTestId('recipe-header')
        await expect(header).toBeVisible()

        // Back button should be present
        const backButton = page.getByTestId('back-button')
        await expect(backButton).toBeVisible()
    })

    // T133: Quick info section
    test('should display quick info section', async ({ page }) => {
        await page.goto('/')

        const recipeCard = page.getByTestId('recipe-card').first()
        await expect(recipeCard).toBeVisible({ timeout: 10000 })
        await recipeCard.click()

        await expect(page.getByTestId('recipe-detail')).toBeVisible({ timeout: 10000 })

        // Quick info should show
        const quickInfo = page.getByTestId('quick-info')
        await expect(quickInfo).toBeVisible()
    })

    // T134: Switch between ingredients and instructions tabs
    test('should switch between ingredients and instructions tabs', async ({ page }) => {
        await page.goto('/')

        const recipeCard = page.getByTestId('recipe-card').first()
        await expect(recipeCard).toBeVisible({ timeout: 10000 })
        await recipeCard.click()

        await expect(page.getByTestId('recipe-detail')).toBeVisible({ timeout: 10000 })

        // Tab switcher should be visible
        const tabSwitcher = page.getByTestId('tab-switcher')
        await expect(tabSwitcher).toBeVisible()

        // Ingredients tab should be active by default
        const ingredientsTab = page.getByTestId('tab-ingredients')
        await expect(ingredientsTab).toBeVisible()

        const ingredientsList = page.getByTestId('ingredients-tab')
        await expect(ingredientsList).toBeVisible()

        // Click instructions tab
        const instructionsTab = page.getByTestId('tab-instructions')
        await instructionsTab.click()

        // Instructions should be visible
        const instructionsList = page.getByTestId('instructions-tab')
        await expect(instructionsList).toBeVisible()

        // Click back to ingredients
        await ingredientsTab.click()
        await expect(ingredientsList).toBeVisible()
    })

    // T135: Adjust servings and see scaled ingredients
    test('should adjust servings with selector', async ({ page }) => {
        await page.goto('/')

        const recipeCard = page.getByTestId('recipe-card').first()
        await expect(recipeCard).toBeVisible({ timeout: 10000 })
        await recipeCard.click()

        await expect(page.getByTestId('recipe-detail')).toBeVisible({ timeout: 10000 })

        // Servings selector should exist
        const servingsSelector = page.getByTestId('servings-selector')
        await expect(servingsSelector).toBeVisible()

        // Get initial servings value
        const servingsValue = page.getByTestId('servings-value')
        const initialServings = await servingsValue.textContent()

        // Increase servings
        const increaseBtn = page.getByTestId('servings-increase')
        await increaseBtn.click()

        // Servings should have increased
        const newServings = await servingsValue.textContent()
        expect(Number(newServings)).toBe(Number(initialServings) + 1)

        // Decrease servings back
        const decreaseBtn = page.getByTestId('servings-decrease')
        await decreaseBtn.click()

        const restoredServings = await servingsValue.textContent()
        expect(Number(restoredServings)).toBe(Number(initialServings))
    })

    // T135: Check ingredient list
    test('should display ingredient items', async ({ page }) => {
        await page.goto('/')

        const recipeCard = page.getByTestId('recipe-card').first()
        await expect(recipeCard).toBeVisible({ timeout: 10000 })
        await recipeCard.click()

        await expect(page.getByTestId('recipe-detail')).toBeVisible({ timeout: 10000 })

        // Ingredients list should show
        const ingredientsList = page.getByTestId('ingredients-list')
        await expect(ingredientsList).toBeVisible()
    })

    // T136: Navigate back from recipe detail
    test('should navigate back via back button', async ({ page }) => {
        await page.goto('/')

        const recipeCard = page.getByTestId('recipe-card').first()
        await expect(recipeCard).toBeVisible({ timeout: 10000 })
        await recipeCard.click()

        await expect(page.getByTestId('recipe-detail')).toBeVisible({ timeout: 10000 })

        // Click back button
        const backButton = page.getByTestId('back-button')
        await backButton.click()

        // Should navigate back to home
        await expect(page).toHaveURL('/')
    })

    // T136: Not-found page for invalid recipe
    test('should show not-found page for invalid recipe ID', async ({ page }) => {
        await page.goto('/recipes/non-existent-recipe-id-12345')

        // Should show 404 content
        await expect(page.getByText('Không tìm thấy công thức')).toBeVisible({ timeout: 10000 })
    })

    // T136: Start cooking button
    test('should show start cooking button', async ({ page }) => {
        await page.goto('/')

        const recipeCard = page.getByTestId('recipe-card').first()
        await expect(recipeCard).toBeVisible({ timeout: 10000 })
        await recipeCard.click()

        await expect(page.getByTestId('recipe-detail')).toBeVisible({ timeout: 10000 })

        // Start cooking bar should be visible at bottom
        const startCookingBar = page.getByTestId('start-cooking-bar')
        await expect(startCookingBar).toBeVisible()

        const startCookingBtn = page.getByTestId('start-cooking-button')
        await expect(startCookingBtn).toBeVisible()
    })

    // T136: Action buttons (save + add to plan)
    test('should display action buttons', async ({ page }) => {
        await page.goto('/')

        const recipeCard = page.getByTestId('recipe-card').first()
        await expect(recipeCard).toBeVisible({ timeout: 10000 })
        await recipeCard.click()

        await expect(page.getByTestId('recipe-detail')).toBeVisible({ timeout: 10000 })

        // Action buttons should be present
        const actionButtons = page.getByTestId('action-buttons')
        await expect(actionButtons).toBeVisible()

        const saveButton = page.getByTestId('save-button')
        await expect(saveButton).toBeVisible()

        const addToPlanButton = page.getByTestId('add-to-plan-button')
        await expect(addToPlanButton).toBeVisible()
    })

    // T136: Responsive layout - desktop viewport
    test('should render properly on desktop viewport', async ({ page }) => {
        // Override to desktop viewport
        await page.setViewportSize({ width: 1280, height: 800 })

        await page.goto('/')

        const recipeCard = page.getByTestId('recipe-card').first()
        await expect(recipeCard).toBeVisible({ timeout: 10000 })
        await recipeCard.click()

        await expect(page.getByTestId('recipe-detail')).toBeVisible({ timeout: 10000 })

        // All sections should be visible on desktop too
        await expect(page.getByTestId('recipe-header')).toBeVisible()
        await expect(page.getByTestId('quick-info')).toBeVisible()
        await expect(page.getByTestId('tab-switcher')).toBeVisible()
    })
})
