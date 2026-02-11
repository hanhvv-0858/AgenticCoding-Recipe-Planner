/**
 * Next.js Edge Middleware — Authentication Session Refresh
 *
 * Runs on every matched request before the route handler.
 * Delegates to `updateSession` which refreshes the Supabase auth token
 * cookie, ensuring the user’s session stays alive across navigations.
 *
 * If the session has expired or is invalid, `updateSession` will clear
 * the cookie and the downstream route/page can redirect to login.
 */
import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest } from 'next/server'

/**
 * Middleware entry point invoked by Next.js for every matching request.
 *
 * @param request - The incoming Next.js request object
 * @returns A `NextResponse` (potentially with refreshed auth cookies)
 */
export async function middleware(request: NextRequest) {
    return await updateSession(request)
}

/**
 * Route matcher configuration.
 *
 * Matches all paths EXCEPT static assets, image optimization files, and
 * common image formats. This ensures auth session refresh runs for pages
 * and API routes but not for static file requests.
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
