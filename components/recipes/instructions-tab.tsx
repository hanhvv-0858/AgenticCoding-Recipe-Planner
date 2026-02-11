import { cn } from '@/lib/utils'
import type { RecipeStepData } from '@/lib/validations/recipe'

interface InstructionsTabProps {
    steps: RecipeStepData[]
    className?: string
}

export function InstructionsTab({ steps, className }: InstructionsTabProps) {
    if (steps.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="instructions-empty">
                <span className="mb-3 text-4xl">📝</span>
                <p className="text-sm text-muted-foreground">Chưa có hướng dẫn nấu ăn</p>
            </div>
        )
    }

    return (
        <div className={cn('space-y-4', className)} data-testid="instructions-tab">
            {steps.map((step) => (
                <div
                    key={step.id}
                    className="flex gap-4 rounded-xl bg-card p-4 shadow-sm"
                    data-testid={`step-${step.step_number}`}
                >
                    {/* Step number */}
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {step.step_number}
                    </div>

                    {/* Step content */}
                    <div className="flex-1 space-y-2">
                        <p className="text-sm leading-relaxed text-foreground">
                            {step.instruction}
                        </p>

                        {step.duration_minutes && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>~{step.duration_minutes} phút</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
