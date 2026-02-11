/**
 * Validation Utilities
 * Helpers for extracting field-level errors from Zod validation results
 */

import type { ZodError } from 'zod'

/**
 * Extract a flat Record<string, string> of field errors from a ZodError.
 * Only the first error per field path is kept.
 */
export function extractFieldErrors(error: ZodError): Record<string, string> {
    const fieldErrors: Record<string, string> = {}
    for (const issue of error.errors) {
        const key = issue.path.join('.')
        if (key && !fieldErrors[key]) {
            fieldErrors[key] = issue.message
        }
    }
    return fieldErrors
}
