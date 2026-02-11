'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'
import type { TagData } from '@/lib/validations/recipe'

interface TagListProps {
    tags: TagData[]
    selectedSlug?: string | null
    onTagSelect: (slug: string | null) => void
    className?: string
}

export function TagList({ tags, selectedSlug, onTagSelect, className }: TagListProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    return (
        <div className={cn('relative', className)} data-testid="tag-list">
            <div
                ref={scrollRef}
                className="scrollbar-hide flex gap-2 overflow-x-auto pb-1"
            >
                {/* All tag */}
                <button
                    onClick={() => onTagSelect(null)}
                    className={cn(
                        'flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors',
                        !selectedSlug
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    )}
                    data-testid="tag-all"
                >
                    🍽️ Tất cả
                </button>

                {tags.map(tag => (
                    <button
                        key={tag.slug}
                        onClick={() => onTagSelect(tag.slug === selectedSlug ? null : tag.slug)}
                        className={cn(
                            'flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors',
                            tag.slug === selectedSlug
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
                        )}
                        data-testid={`tag-${tag.slug}`}
                    >
                        {tag.icon_emoji && <span>{tag.icon_emoji}</span>}
                        <span className="whitespace-nowrap">{tag.name}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
