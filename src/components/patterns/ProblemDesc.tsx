"use client";

import { useState, useRef, useEffect } from "react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProblemDescProps {
  slug: string;
}

export function ProblemDesc({ slug }: ProblemDescProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || content) return;
    let cancelled = false;
    fetch(`/api/leetcode?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setContent(data.content ?? "No description available");
      })
      .catch(() => {
        if (!cancelled) setContent("Failed to load description");
      });
    return () => {
      cancelled = true;
    };
  }, [open, slug, content]);

  const sanitizedContent = content ? sanitizeHtml(content) : "";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <FileText size={12} strokeWidth={1.5} />
        <span>Desc</span>
      </button>

      {open && (
        <div
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2",
            "rounded-lg border border-border bg-background shadow-xl",
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">
              {slug.replace(/-/g, " ")}
            </h3>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-4">
            {content === null ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              </div>
            ) : (
              <div
                className="prose prose-sm prose-invert max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function sanitizeHtml(html: string): string {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/ on\w+="[^"]*"/gi, "")
      .replace(/ on\w+='[^']*'/gi, "");
  }

  const parser = new DOMParser();
  const parsed = parser.parseFromString(html, "text/html");
  const allowedTags = new Set([
    "a",
    "abbr",
    "b",
    "blockquote",
    "br",
    "code",
    "div",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "i",
    "li",
    "ol",
    "p",
    "pre",
    "span",
    "strong",
    "table",
    "tbody",
    "td",
    "th",
    "thead",
    "tr",
    "ul",
  ]);

  const walk = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent || "");
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const element = node as Element;
    if (!allowedTags.has(element.tagName.toLowerCase())) {
      const fragment = document.createDocumentFragment();
      element.childNodes.forEach((child) => {
        const safeChild = walk(child);
        if (safeChild) fragment.appendChild(safeChild);
      });
      return fragment;
    }

    const safeElement = document.createElement(element.tagName.toLowerCase());
    if (safeElement.tagName.toLowerCase() === "a") {
      const href = element.getAttribute("href");
      if (href && /^https?:\/\//i.test(href)) {
        safeElement.setAttribute("href", href);
        safeElement.setAttribute("rel", "noreferrer noopener");
        safeElement.setAttribute("target", "_blank");
      }
    }

    element.childNodes.forEach((child) => {
      const safeChild = walk(child);
      if (safeChild) safeElement.appendChild(safeChild);
    });

    return safeElement;
  };

  const container = document.createElement("div");
  parsed.body.childNodes.forEach((child) => {
    const safeChild = walk(child);
    if (safeChild) container.appendChild(safeChild);
  });

  return container.innerHTML;
}
