'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ModalProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    title?: string
    description?: string
    size?: 'sm' | 'md' | 'lg' | 'full'
    showCloseButton?: boolean
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    children,
    title,
    description,
    size = 'md',
    showCloseButton = true,
}) => {
    const modalId = React.useId()
    const titleId = `${modalId}-title`
    const descId = `${modalId}-desc`

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    if (!isOpen) return null

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        full: 'max-w-full mx-4',
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal Content */}
            <div
                className={cn(
                    'relative w-full rounded-lg bg-background p-6 shadow-lg',
                    'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2',
                    sizes[size]
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                {showCloseButton && (
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        <span className="sr-only">Đóng</span>
                    </button>
                )}

                {/* Header */}
                {(title || description) && (
                    <div className="mb-4">
                        {title && (
                            <h2 id={titleId} className="text-lg font-semibold leading-none tracking-tight">
                                {title}
                            </h2>
                        )}
                        {description && (
                            <p id={descId} className="mt-2 text-sm text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                )}

                {/* Body */}
                <div>{children}</div>
            </div>
        </div>
    )
}

Modal.displayName = 'Modal'

export { Modal }
