'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Hook to track the count of unchecked grocery list items.
 * Shows a badge on the Grocery nav item with the count.
 *
 * Uses Supabase Realtime to stay in sync when items are
 * added, checked off, or removed from the grocery list.
 */
export function useGroceryBadge() {
    const [count, setCount] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(true)

    const fetchCount = useCallback(async () => {
        try {
            const supabase = createClient()
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                setCount(0)
                setIsLoading(false)
                return
            }

            const { count: uncheckedCount, error } = await supabase
                .from('grocery_list_items')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_checked', false)

            if (error) {
                console.error('Error fetching grocery count:', error)
                setCount(0)
            } else {
                setCount(uncheckedCount ?? 0)
            }
        } catch {
            setCount(0)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCount()

        // Subscribe to realtime changes on grocery_list_items
        const supabase = createClient()
        const channel = supabase
            .channel('grocery-badge')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'grocery_list_items',
                },
                () => {
                    // Re-fetch count on any change
                    fetchCount()
                }
            )
            .subscribe()

        // Also listen for auth state changes
        const {
            data: { subscription: authSubscription },
        } = supabase.auth.onAuthStateChange(() => {
            fetchCount()
        })

        return () => {
            supabase.removeChannel(channel)
            authSubscription.unsubscribe()
        }
    }, [fetchCount])

    return { count, isLoading, refetch: fetchCount }
}
