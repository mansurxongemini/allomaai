"use client"

import DOMPurify from "dompurify"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface SafeHTMLProps {
    html: string
    className?: string
}

export function SafeHTML({ html, className }: SafeHTMLProps) {
    const [sanitizedHtml, setSanitizedHtml] = useState("")

    useEffect(() => {
        // Only sanitize on the client
        setSanitizedHtml(DOMPurify.sanitize(html))
    }, [html])

    return (
        <div
            className={cn("prose-container", className)}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml || "" }}
        />
    )
}
