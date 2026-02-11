'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { RecipeImage } from '@/components/recipes/recipe-image'

interface RecipeHeaderProps {
    name: string
    coverImageUrl: string
    className?: string
}

export function RecipeHeader({ name, coverImageUrl, className }: RecipeHeaderProps) {
    const router = useRouter()

    return (
        <div className={cn('relative', className)} data-testid="recipe-header">
            {/* Cover Image with parallax-like effect */}
            <div className="relative h-64 overflow-hidden sm:h-80 lg:h-96">
                <RecipeImage
                    src={coverImageUrl}
                    alt={name}
                    fill
                    priority
                    className="object-cover"
                    sizes="100vw"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Back button */}
                <button
                    onClick={() => router.back()}
                    className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                    aria-label="Quay lại"
                    data-testid="back-button"
                >
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h1 className="text-2xl font-bold text-white drop-shadow-lg sm:text-3xl">
                        {name}
                    </h1>
                </div>
            </div>
        </div>
    )
}
