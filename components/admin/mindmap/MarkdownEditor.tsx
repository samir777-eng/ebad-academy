"use client";

import "easymde/dist/easymde.min.css";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Dynamically import SimpleMDE to avoid SSR issues
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  locale: string;
  minHeight?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  label,
  placeholder,
  locale,
  minHeight = "200px",
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  // SimpleMDE options
  const editorOptions = useMemo(() => {
    return {
      spellChecker: false,
      placeholder:
        placeholder || (locale === "ar" ? "اكتب هنا..." : "Write here..."),
      minHeight: minHeight,
      status: false,
      toolbar: [
        "bold",
        "italic",
        "heading",
        "|",
        "quote",
        "unordered-list",
        "ordered-list",
        "|",
        "link",
        "image",
        "|",
        "preview",
        "side-by-side",
        "fullscreen",
        "|",
        "guide",
      ],
    };
  }, [placeholder, locale, minHeight]);

  return (
    <div className="space-y-2">
      <style jsx global>{`
        .EasyMDEContainer .editor-toolbar button {
          color: #374151 !important;
        }
        .EasyMDEContainer .editor-toolbar button:hover {
          background-color: #f3f4f6 !important;
          color: #111827 !important;
        }
        .EasyMDEContainer .editor-toolbar i.separator {
          border-left-color: #d1d5db !important;
        }
        .EasyMDEContainer
          .editor-toolbar.disabled-for-preview
          button:not(.no-disable) {
          opacity: 0.4 !important;
        }
      `}</style>
      {/* Label and Preview Toggle */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-900">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          {showPreview
            ? locale === "ar"
              ? "تحرير"
              : "Edit"
            : locale === "ar"
            ? "معاينة"
            : "Preview"}
        </button>
      </div>

      {/* Editor or Preview */}
      {showPreview ? (
        <div className="border border-gray-300 rounded-lg p-4 bg-white min-h-[200px] prose prose-sm max-w-none">
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-gray-400 italic">
              {locale === "ar"
                ? "لا يوجد محتوى للمعاينة"
                : "No content to preview"}
            </p>
          )}
        </div>
      ) : (
        <SimpleMDE
          value={value}
          onChange={onChange as any}
          options={editorOptions as any}
        />
      )}

      {/* Markdown Help */}
      <details className="text-xs text-gray-600">
        <summary className="cursor-pointer hover:text-gray-900">
          {locale === "ar" ? "مساعدة Markdown" : "Markdown Help"}
        </summary>
        <div className="mt-2 space-y-1 bg-gray-50 p-3 rounded">
          <p>
            <code>**{locale === "ar" ? "نص عريض" : "bold text"}**</code> →{" "}
            <strong>{locale === "ar" ? "نص عريض" : "bold text"}</strong>
          </p>
          <p>
            <code>*{locale === "ar" ? "نص مائل" : "italic text"}*</code> →{" "}
            <em>{locale === "ar" ? "نص مائل" : "italic text"}</em>
          </p>
          <p>
            <code># {locale === "ar" ? "عنوان" : "Heading"}</code> →{" "}
            {locale === "ar" ? "عنوان كبير" : "Large heading"}
          </p>
          <p>
            <code>- {locale === "ar" ? "عنصر قائمة" : "List item"}</code> →{" "}
            {locale === "ar" ? "قائمة نقطية" : "Bullet list"}
          </p>
          <p>
            <code>[{locale === "ar" ? "نص" : "text"}](url)</code> →{" "}
            {locale === "ar" ? "رابط" : "Link"}
          </p>
        </div>
      </details>
    </div>
  );
}
