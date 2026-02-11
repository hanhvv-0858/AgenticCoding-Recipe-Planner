/**
 * Rate Limiting Utility
 * Simple in-memory sliding window rate limiter for server actions
 */

interface RateLimitEntry {
    timestamps: number[]
}

const store = new Map<string, RateLimitEntry>()

// Clean up entries older than the window periodically
const CLEANUP_INTERVAL = 60_000 // 1 minute
let lastCleanup = Date.now()

function cleanup(windowMs: number) {
    const now = Date.now()
    if (now - lastCleanup < CLEANUP_INTERVAL) return
    lastCleanup = now
    const cutoff = now - windowMs
    for (const [key, entry] of store) {
        entry.timestamps = entry.timestamps.filter((t) => t > cutoff)
        if (entry.timestamps.length === 0) {
            store.delete(key)
        }
    }
}

interface RateLimitConfig {
    /** Maximum number of requests allowed within the window */
    maxRequests: number
    /** Time window in milliseconds */
    windowMs: number
}

interface RateLimitResult {
    allowed: boolean
    remaining: number
    retryAfterMs?: number
}

/**
 * Check if a request is within rate limits.
 * Uses an in-memory sliding window approach.
 *
 * @param key - Unique identifier (e.g., userId or IP + action)
 * @param config - Rate limit configuration
 * @returns Whether the request is allowed
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now()
    const cutoff = now - config.windowMs

    cleanup(config.windowMs)

    let entry = store.get(key)
    if (!entry) {
        entry = { timestamps: [] }
        store.set(key, entry)
    }

    // Remove expired timestamps
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff)

    if (entry.timestamps.length >= config.maxRequests) {
        const oldestInWindow = entry.timestamps[0]!
        return {
            allowed: false,
            remaining: 0,
            retryAfterMs: oldestInWindow + config.windowMs - now,
        }
    }

    entry.timestamps.push(now)
    return {
        allowed: true,
        remaining: config.maxRequests - entry.timestamps.length,
    }
}

/**
 * Preset rate limit configs for common actions
 */
export const RATE_LIMITS = {
    /** Auth actions: 10 attempts per 15 minutes */
    auth: { maxRequests: 10, windowMs: 15 * 60 * 1000 },
    /** Mutation actions: 30 per minute */
    mutation: { maxRequests: 30, windowMs: 60 * 1000 },
    /** Read actions: 60 per minute */
    read: { maxRequests: 60, windowMs: 60 * 1000 },
} as const
