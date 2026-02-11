import { test, expect } from '@playwright/test'

test.describe('Authentication Pages', () => {
    test.describe('Login Page', () => {
        test('should display login form with all fields', async ({ page }) => {
            await page.goto('/login')

            await expect(page.getByText('Đăng nhập', { exact: true }).first()).toBeVisible()
            await expect(page.getByLabel(/Email/i)).toBeVisible()
            await expect(page.getByLabel(/Mật khẩu/i)).toBeVisible()
            await expect(page.getByTestId('auth-submit')).toBeVisible()
            await expect(page.getByText('Đăng ký ngay')).toBeVisible()
        })

        test('should have link to register page', async ({ page }) => {
            await page.goto('/login')

            const registerLink = page.getByRole('link', { name: 'Đăng ký ngay' })
            await expect(registerLink).toBeVisible()
            await expect(registerLink).toHaveAttribute('href', '/register')
        })

        test('should show email and password inputs as required', async ({ page }) => {
            await page.goto('/login')

            const emailInput = page.getByLabel(/Email/i)
            const passwordInput = page.getByLabel(/Mật khẩu/i)

            await expect(emailInput).toHaveAttribute('required', '')
            await expect(passwordInput).toHaveAttribute('required', '')
        })

        test('should have correct autocomplete attributes', async ({ page }) => {
            await page.goto('/login')

            const emailInput = page.getByLabel(/Email/i)
            const passwordInput = page.getByLabel(/Mật khẩu/i)

            await expect(emailInput).toHaveAttribute('autocomplete', 'email')
            await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password')
        })
    })

    test.describe('Register Page', () => {
        test('should display registration form with all fields', async ({ page }) => {
            await page.goto('/register')

            await expect(page.getByText('Đăng ký tài khoản')).toBeVisible()
            await expect(page.getByLabel(/Tên hiển thị/i)).toBeVisible()
            await expect(page.getByLabel(/Email/i)).toBeVisible()
            // Multiple password fields - get first and second
            const passwordInputs = page.locator('input[type="password"]')
            await expect(passwordInputs).toHaveCount(2)
            await expect(page.getByTestId('auth-submit')).toBeVisible()
            await expect(page.getByText('Đăng nhập', { exact: false })).toBeVisible()
        })

        test('should have link to login page', async ({ page }) => {
            await page.goto('/register')

            const loginLink = page.getByRole('link', { name: 'Đăng nhập' })
            await expect(loginLink).toBeVisible()
            await expect(loginLink).toHaveAttribute('href', '/login')
        })

        test('should show email and password as required, display name as optional', async ({ page }) => {
            await page.goto('/register')

            const displayNameInput = page.getByLabel(/Tên hiển thị/i)
            const emailInput = page.getByLabel(/Email/i)

            await expect(emailInput).toHaveAttribute('required', '')
            // Display name should not be required
            await expect(displayNameInput).not.toHaveAttribute('required', '')
        })
    })

    test.describe('Auth Route Navigation', () => {
        test('should navigate from login to register', async ({ page }) => {
            await page.goto('/login')

            await page.getByRole('link', { name: 'Đăng ký ngay' }).click()
            await page.waitForURL('**/register')

            await expect(page.getByText('Đăng ký tài khoản')).toBeVisible()
        })

        test('should navigate from register to login', async ({ page }) => {
            await page.goto('/register')

            await page.getByRole('link', { name: 'Đăng nhập' }).click()
            await page.waitForURL('**/login')

            await expect(page.getByText('Đăng nhập', { exact: true }).first()).toBeVisible()
        })
    })

    test.describe('Protected Route Redirects', () => {
        test('should redirect /cookbook to /login when not authenticated', async ({ page }) => {
            await page.goto('/cookbook')

            // Should be redirected to login with redirect param
            await page.waitForURL('**/login**')
            await expect(page).toHaveURL(/\/login/)
        })

        test('should redirect /planner to /login when not authenticated', async ({ page }) => {
            await page.goto('/planner')

            await page.waitForURL('**/login**')
            await expect(page).toHaveURL(/\/login/)
        })

        test('should redirect /grocery to /login when not authenticated', async ({ page }) => {
            await page.goto('/grocery')

            await page.waitForURL('**/login**')
            await expect(page).toHaveURL(/\/login/)
        })

        test('should redirect /profile to /login when not authenticated', async ({ page }) => {
            await page.goto('/profile')

            await page.waitForURL('**/login**')
            await expect(page).toHaveURL(/\/login/)
        })

        test('should include redirect parameter in login URL', async ({ page }) => {
            await page.goto('/cookbook')

            await page.waitForURL('**/login**')
            await expect(page).toHaveURL(/redirect=%2Fcookbook/)
        })
    })

    test.describe('Auth Layout', () => {
        test('should show app branding on login page', async ({ page }) => {
            await page.goto('/login')

            await expect(page.getByText('Recipe Planner')).toBeVisible()
            await expect(page.getByText('Lên thực đơn & danh sách mua sắm')).toBeVisible()
        })

        test('should show app branding on register page', async ({ page }) => {
            await page.goto('/register')

            await expect(page.getByText('Recipe Planner')).toBeVisible()
        })

        test('should not show bottom navigation on auth pages', async ({ page }) => {
            await page.goto('/login')

            const bottomNav = page.locator('nav[aria-label="Main navigation"]')
            await expect(bottomNav).not.toBeVisible()
        })
    })

    test.describe('Home Page Access', () => {
        test('should allow access to home page without authentication', async ({ page }) => {
            await page.goto('/')

            // Should not be redirected to login
            await expect(page).toHaveURL(/\/$/)
        })
    })
})
