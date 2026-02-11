'use client'

import * as React from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AuthState, AuthUser, UserProfile } from '@/types/auth'
import type { Database } from '@/types/database'

type UserProfileRow = Database['public']['Tables']['user_profiles']['Row']
type UserWithProfile = AuthUser & UserProfile

interface UseUserReturn extends AuthState {
    refresh: () => Promise<void>
}

/**
 * Client-side hook for auth state management
 * Listens to Supabase auth state changes and fetches profile data
 */
export function useUser(): UseUserReturn {
    const [user, setUser] = React.useState<UserWithProfile | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)

    const fetchUserProfile = React.useCallback(async () => {
        const supabase = createClient()

        const {
            data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
            setUser(null)
            setIsLoading(false)
            return
        }

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authUser.id)
            .single() as unknown as { data: UserProfileRow | null }

        setUser({
            id: authUser.id,
            email: authUser.email!,
            createdAt: authUser.created_at,
            displayName: profile?.display_name ?? null,
            preferredUnitSystem: profile?.preferred_unit_system ?? 'metric',
            dietaryPreferences: (profile?.dietary_preferences as string[]) ?? [],
            updatedAt: profile?.updated_at ?? authUser.created_at,
        })
        setIsLoading(false)
    }, [])

    React.useEffect(() => {
        fetchUserProfile()

        const supabase = createClient()
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                fetchUserProfile()
            } else {
                setUser(null)
                setIsLoading(false)
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [fetchUserProfile])

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        refresh: fetchUserProfile,
    }
}
