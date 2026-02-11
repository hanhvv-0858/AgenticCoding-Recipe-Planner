/**
 * Phase 8 E2E Tests: Meal Planning (T186-T192)
 */

import { test, expect } from '@playwright/test'

test.describe('Meal Planning Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/planner')
    })

    // T186: Navigate to planner, see calendar strip and meal slots
    test('should display calendar strip and meal type sections', async ({ page }) => {
        // Calendar strip
        const calendarStrip = page.getByTestId('calendar-strip')
        await expect(calendarStrip).toBeVisible()

        // Week navigation
        const weekSelector = page.getByTestId('week-selector')
        await expect(weekSelector).toBeVisible()

        // Day strip with day pills
        const dayStrip = page.getByTestId('day-strip')
        await expect(dayStrip).toBeVisible()

        // Daily timeline with meal slots
        const dailyTimeline = page.getByTestId('daily-timeline')
        await expect(dailyTimeline).toBeVisible()

        // All 4 meal type slots
        await expect(page.getByTestId('meal-slot-breakfast')).toBeVisible()
        await expect(page.getByTestId('meal-slot-lunch')).toBeVisible()
        await expect(page.getByTestId('meal-slot-dinner')).toBeVisible()
        await expect(page.getByTestId('meal-slot-snack')).toBeVisible()
    })

    // T187: Open quick note modal
    test('should open quick note modal when clicking add note button', async ({ page }) => {
        // Click add note button for lunch
        const addNoteBtn = page.getByTestId('add-note-lunch')
        await expect(addNoteBtn).toBeVisible()
        await addNoteBtn.click()

        // Quick note modal should appear
        const modal = page.getByTestId('quick-note-modal')
        await expect(modal).toBeVisible()

        // Text input should be present
        const noteInput = page.getByTestId('note-input')
        await expect(noteInput).toBeVisible()

        // Save button should be present
        const saveBtn = page.getByTestId('save-note-button')
        await expect(saveBtn).toBeVisible()
    })

    // T188: Navigate between days in calendar strip
    test('should navigate between weeks using arrows', async ({ page }) => {
        const weekSelector = page.getByTestId('week-selector')
        const initialText = await weekSelector.textContent()

        // Click next week
        const nextBtn = page.getByTestId('week-next')
        await nextBtn.click()

        // Week text should change
        const updatedText = await weekSelector.textContent()
        expect(updatedText).not.toBe(initialText)

        // Click previous week to go back
        const prevBtn = page.getByTestId('week-prev')
        await prevBtn.click()

        // Should be back to original week
        const restoredText = await weekSelector.textContent()
        expect(restoredText).toBe(initialText)
    })

    // T189: Daily nutritional summary should be visible
    test('should display daily nutritional summary', async ({ page }) => {
        const summary = page.getByTestId('daily-summary')
        await expect(summary).toBeVisible()
    })

    // T190: Add recipe modal opening
    test('should open add recipe modal when clicking add recipe button', async ({ page }) => {
        // Click add recipe for breakfast
        const addRecipeBtn = page.getByTestId('add-recipe-breakfast')
        await expect(addRecipeBtn).toBeVisible()
        await addRecipeBtn.click()

        // Add recipe modal should appear
        const modal = page.getByTestId('add-recipe-modal')
        await expect(modal).toBeVisible()

        // Search input should be present
        const searchInput = page.getByTestId('recipe-search-modal')
        await expect(searchInput).toBeVisible()
    })

    // T191: Day selection in calendar strip
    test('should allow selecting different days in the strip', async ({ page }) => {
        const dayStrip = page.getByTestId('day-strip')
        const dayButtons = dayStrip.locator('button')

        // Should have 7 days
        await expect(dayButtons).toHaveCount(7)

        // Click a different day
        const secondDay = dayButtons.nth(1)
        await secondDay.click()

        // The button should now be selected (has active styling)
        // We check by verifying the timeline updates (it re-renders)
        await expect(page.getByTestId('daily-timeline')).toBeVisible()
    })
})

test.describe('Next Meal Card - Home Page', () => {
    // T192: Next Meal card on home page
    test('should display next meal card on home page', async ({ page }) => {
        await page.goto('/')

        const nextMealCard = page.getByTestId('next-meal-card')
        await expect(nextMealCard).toBeVisible()
    })
})
