'use client'

/**
 * ShareListModal Component (T211)
 * Modal for sharing grocery list text
 */

import { useState, useEffect } from 'react'

interface ShareListModalProps {
    open: boolean
    onClose: () => void
    shareText: string
}

export function ShareListModal({ open, onClose, shareText }: ShareListModalProps) {
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!open) setCopied(false)
    }, [open])

    if (!open) return null

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareText)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Fallback for older browsers
            const textarea = document.createElement('textarea')
            textarea.value = shareText
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" data-testid="share-list-modal">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />

            {/* Modal */}
            <div className="relative max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-background p-4 shadow-xl sm:rounded-2xl">
                <h3 className="mb-3 text-lg font-semibold text-foreground">
                    📤 Chia sẻ danh sách
                </h3>

                <div
                    className="mb-4 max-h-60 overflow-y-auto rounded-lg border border-border bg-muted/30 p-3 font-mono text-xs text-foreground whitespace-pre-wrap"
                    data-testid="share-text-preview"
                >
                    {shareText || 'Không có nguyên liệu nào cần mua.'}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                    >
                        Đóng
                    </button>
                    <button
                        onClick={handleCopy}
                        className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        data-testid="copy-share-text"
                    >
                        {copied ? '✓ Đã sao chép' : '📋 Sao chép'}
                    </button>
                </div>
            </div>
        </div>
    )
}
