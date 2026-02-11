'use client'

/**
 * RecipeImage Component
 * Wrapper around next/image with fallback for missing/broken recipe images
 */

import Image from 'next/image'
import { useState } from 'react'

interface RecipeImageProps {
    src: string
    alt: string
    fill?: boolean
    className?: string
    sizes?: string
    priority?: boolean
}

const PLACEHOLDER_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-size='48' fill='%239ca3af'%3E🍳%3C/text%3E%3Ctext x='50%25' y='60%25' dominant-baseline='middle' text-anchor='middle' font-size='14' fill='%239ca3af'%3EKh%C3%B4ng c%C3%B3 h%C3%ACnh%3C/text%3E%3C/svg%3E"

export function RecipeImage({ src, alt, fill, className, sizes, priority }: RecipeImageProps) {
    const [imgSrc, setImgSrc] = useState(src || PLACEHOLDER_SVG)
    const [hasError, setHasError] = useState(false)

    const handleError = () => {
        if (!hasError) {
            setHasError(true)
            setImgSrc(PLACEHOLDER_SVG)
        }
    }

    return (
        <Image
            src={imgSrc}
            alt={alt}
            fill={fill}
            className={className}
            sizes={sizes}
            priority={priority}
            onError={handleError}
            unoptimized={hasError}
        />
    )
}
