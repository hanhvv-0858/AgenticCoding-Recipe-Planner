import { cn } from '@/lib/utils'

interface QuickInfoProps {
    cookingTimeMinutes: number
    prepTimeMinutes: number | null
    caloriesPerServing: number | null
    rating: number | null
    ratingCount: number
    difficultyLevel: 'easy' | 'medium' | 'hard' | null
    className?: string
}

function formatTime(minutes: number): string {
    if (minutes < 60) return `${minutes} phút`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}p` : `${hours}h`
}

function getDifficultyLabel(level: string | null): string {
    switch (level) {
        case 'easy': return 'Dễ'
        case 'medium': return 'Trung bình'
        case 'hard': return 'Khó'
        default: return ''
    }
}

function getDifficultyColor(level: string | null): string {
    switch (level) {
        case 'easy': return 'text-green-600 dark:text-green-400'
        case 'medium': return 'text-yellow-600 dark:text-yellow-400'
        case 'hard': return 'text-red-600 dark:text-red-400'
        default: return ''
    }
}

export function QuickInfo({
    cookingTimeMinutes,
    prepTimeMinutes,
    caloriesPerServing,
    rating,
    ratingCount,
    difficultyLevel,
    className,
}: QuickInfoProps) {
    const totalTime = cookingTimeMinutes + (prepTimeMinutes ?? 0)

    return (
        <div className={cn('flex flex-wrap items-center gap-4 rounded-xl bg-card p-4 shadow-sm', className)} data-testid="quick-info">
            {/* Total Time */}
            <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <svg className="size-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Tổng thời gian</p>
                    <p className="text-sm font-semibold">{formatTime(totalTime)}</p>
                </div>
            </div>

            {/* Calories */}
            {caloriesPerServing && (
                <div className="flex items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                        <span className="text-sm">🔥</span>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Calories</p>
                        <p className="text-sm font-semibold">{caloriesPerServing} cal</p>
                    </div>
                </div>
            )}

            {/* Rating */}
            {rating !== null && (
                <div className="flex items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                        <svg className="size-4 fill-yellow-500 text-yellow-500" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Đánh giá</p>
                        <p className="text-sm font-semibold">{rating.toFixed(1)} ({ratingCount})</p>
                    </div>
                </div>
            )}

            {/* Difficulty */}
            {difficultyLevel && (
                <div className="flex items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                        <span className="text-sm">📊</span>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Độ khó</p>
                        <p className={cn('text-sm font-semibold', getDifficultyColor(difficultyLevel))}>
                            {getDifficultyLabel(difficultyLevel)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
