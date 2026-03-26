"use client";

import React, { useMemo } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: true });

export default function MarkdownContent({
    markdown,
    className,
}: {
    markdown: string;
    className?: string;
}) {
    const html = useMemo(() => {
        const raw = marked.parse(markdown || "");
        return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
    }, [markdown]);

    return (
        <div
            className={[
                "text-xs text-white/75 font-robotoMono leading-relaxed",
                "[&_p]:mb-2 [&_p]:whitespace-pre-wrap",
                "[&_a]:text-blue-400 [&_a]:hover:text-blue-300",
                "[&_code]:bg-white/[0.05] [&_code]:px-1 [&_code]:rounded",
                "[&_pre]:bg-white/[0.05] [&_pre]:rounded-lg [&_pre]:p-3",
                "[&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5",
                className || "",
            ].join(" ")}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

