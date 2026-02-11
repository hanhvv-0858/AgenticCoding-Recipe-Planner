'use client'

import { useOnlineStatus } from '@/hooks/use-online-status'

/**
 * T251: Offline banner — shown when user loses internet connection
 * Fixed at top, dismissible, with polite aria-live for screen readers
 */
export function OfflineBanner() {
    const isOnline = useOnlineStatus()

    if (isOnline) return null

    return (
        <div
            className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white shadow-md"
            role="alert"
            aria-live="assertive"
        >
            <svg className="size-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.828a5 5 0 000-7.072M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            <span>Bạn đang ngoại tuyến. Một số tính năng có thể không khả dụng.</span>
        </div>
    )
}
