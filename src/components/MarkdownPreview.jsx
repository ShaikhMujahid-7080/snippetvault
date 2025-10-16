// ✅ UPDATED (2025-10-16 15:12 IST)

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownPreview({ content, className }) {
  return (
    <div className={`prose prose-sm dark:prose-invert text-gray-700 dark:text-gray-300 ${className}`}>
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkGfm]}  // Support GitHub-flavored markdown (tables, strikethrough, task lists)
        skipHtml={false}
        breaks={true}  // preserve line breaks inside paragraphs
      />
    </div>
  );
}
