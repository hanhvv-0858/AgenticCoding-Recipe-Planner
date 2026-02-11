/**
 * Error Handling Utilities
 * Centralized error handling for consistent error messages
 */

import { ZodError } from 'zod'

/**
 * Custom application errors
 */
export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message)
        this.name = 'AppError'
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource') {
        super(`${resource} không tồn tại`, 404, 'NOT_FOUND')
        this.name = 'NotFoundError'
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Bạn cần đăng nhập để thực hiện hành động này') {
        super(message, 401, 'UNAUTHORIZED')
        this.name = 'UnauthorizedError'
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Bạn không có quyền thực hiện hành động này') {
        super(message, 403, 'FORBIDDEN')
        this.name = 'ForbiddenError'
    }
}

export class ValidationError extends AppError {
    constructor(message: string = 'Dữ liệu không hợp lệ', public errors?: Record<string, string[]>) {
        super(message, 400, 'VALIDATION_ERROR')
        this.name = 'ValidationError'
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Dữ liệu đã tồn tại') {
        super(message, 409, 'CONFLICT')
        this.name = 'ConflictError'
    }
}

/**
 * Format Zod validation errors
 */
export function formatZodErrors(error: ZodError): Record<string, string[]> {
    const formatted: Record<string, string[]> = {}

    error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!formatted[path]) {
            formatted[path] = []
        }
        formatted[path].push(err.message)
    })

    return formatted
}

/**
 * Handle Zod validation errors
 */
export function handleZodError(error: ZodError): ValidationError {
    const errors = formatZodErrors(error)
    return new ValidationError('Dữ liệu không hợp lệ', errors)
}

/**
 * Safe error message extraction
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof AppError) {
        return error.message
    }

    if (error instanceof ZodError) {
        const firstError = error.errors[0]
        return firstError?.message || 'Dữ liệu không hợp lệ'
    }

    if (error instanceof Error) {
        return error.message
    }

    return 'Đã xảy ra lỗi không xác định'
}

/**
 * Create error response for API
 */
export interface ErrorResponse {
    error: {
        message: string
        code?: string
        statusCode: number
        errors?: Record<string, string[]>
    }
}

export function createErrorResponse(error: unknown): ErrorResponse {
    if (error instanceof AppError) {
        return {
            error: {
                message: error.message,
                code: error.code,
                statusCode: error.statusCode,
                errors: error instanceof ValidationError ? error.errors : undefined,
            },
        }
    }

    if (error instanceof ZodError) {
        return {
            error: {
                message: 'Dữ liệu không hợp lệ',
                code: 'VALIDATION_ERROR',
                statusCode: 400,
                errors: formatZodErrors(error),
            },
        }
    }

    // Generic error
    return {
        error: {
            message: getErrorMessage(error),
            statusCode: 500,
        },
    }
}

/**
 * Try-catch wrapper for async operations
 */
export async function tryCatch<T>(
    operation: () => Promise<T>
): Promise<[T, null] | [null, Error]> {
    try {
        const result = await operation()
        return [result, null]
    } catch (error) {
        return [null, error instanceof Error ? error : new Error(String(error))]
    }
}

/**
 * Assert non-null value
 */
export function assertExists<T>(
    value: T | null | undefined,
    errorMessage: string = 'Value does not exist'
): asserts value is T {
    if (value === null || value === undefined) {
        throw new NotFoundError(errorMessage)
    }
}
