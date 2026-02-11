import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
    dir: './',
})

const config: Config = {
    coverageProvider: 'v8',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    testMatch: [
        '**/tests/unit/**/*.test.ts',
        '**/tests/unit/**/*.test.tsx',
        '**/tests/integration/**/*.test.ts',
        '**/tests/integration/**/*.test.tsx',
    ],
    collectCoverageFrom: [
        'lib/**/*.{js,jsx,ts,tsx}',
        'components/**/*.{js,jsx,ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
    ],
}

export default createJestConfig(config)
