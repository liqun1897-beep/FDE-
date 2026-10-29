import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Info, AlertTriangle, Lightbulb, FileText } from 'lucide-react';
import { formatMarkdownContent } from '../lib/formatMarkdown';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const formattedContent = formatMarkdownContent(content || '');

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!content) {
    return <div className="text-slate-400 italic text-sm py-4">暂无内容</div>;
  }

  return (
    <div className={`relative group ${className}`}>
      
      {/* Floating Copy Button */}
      <div className="absolute right-2 top-2 opacity-80 hover:opacity-100 transition-opacity z-10">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white/95 hover:bg-white border border-slate-200 rounded-lg shadow-sm transition-all hover:border-blue-400"
          title="复制 Markdown 原文"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copied ? '已复制原文' : '复制全文'}</span>
        </button>
      </div>

      {/* Styled Markdown Container */}
      <div className="prose prose-slate max-w-none 
        prose-h1:text-2xl prose-h1:font-bold prose-h1:text-slate-900 prose-h1:pb-3 prose-h1:border-b prose-h1:border-slate-200 prose-h1:mt-2
        prose-h2:text-lg prose-h2:font-bold prose-h2:text-slate-900 prose-h2:bg-slate-50 prose-h2:p-3.5 prose-h2:rounded-xl prose-h2:border prose-h2:border-slate-200/80 prose-h2:mt-7 prose-h2:mb-3.5
        prose-h3:text-sm prose-h3:font-bold prose-h3:text-blue-900 prose-h3:mt-5 prose-h3:mb-2 prose-h3:flex prose-h3:items-center prose-h3:gap-2
        prose-p:text-xs prose-p:text-slate-700 prose-p:leading-relaxed
        prose-ul:text-xs prose-ul:my-2.5 prose-ul:space-y-1.5 prose-ul:text-slate-700
        prose-li:my-0.5
        prose-strong:text-slate-900 prose-strong:font-bold
        prose-table:border prose-table:border-slate-200 prose-table:rounded-xl prose-table:overflow-hidden prose-table:my-4 prose-table:text-xs
        prose-th:bg-slate-100 prose-th:text-slate-800 prose-th:font-bold prose-th:p-2.5 prose-th:border-b prose-th:border-slate-200
        prose-td:p-2.5 prose-td:border-b prose-td:border-slate-100
        prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50/70 prose-blockquote:p-3.5 prose-blockquote:rounded-r-xl prose-blockquote:my-3 prose-blockquote:text-blue-950 prose-blockquote:not-italic
        prose-code:text-blue-700 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-[11px] prose-code:before:content-none prose-code:after:content-none
      ">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ node, ...props }) => (
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 bg-gradient-to-r from-slate-100 to-blue-50/40 p-3 rounded-xl border border-slate-200 shadow-2xs mt-6 mb-3">
                <span className="w-2 h-5 rounded-full bg-blue-600 shrink-0"></span>
                <span>{props.children}</span>
              </h2>
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-sm font-bold text-slate-800 mt-4 mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>{props.children}</span>
              </h3>
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-blue-600 bg-blue-50/60 p-3.5 rounded-r-xl my-3 text-xs text-blue-950 font-medium">
                {props.children}
              </blockquote>
            ),
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-4 border border-slate-200 rounded-xl shadow-2xs">
                <table className="w-full text-left text-xs divide-y divide-slate-200">
                  {props.children}
                </table>
              </div>
            ),
            th: ({ node, ...props }) => (
              <th className="bg-slate-100 p-2.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                {props.children}
              </th>
            ),
            td: ({ node, ...props }) => (
              <td className="p-2.5 text-xs text-slate-700 border-t border-slate-100">
                {props.children}
              </td>
            ),
          }}
        >
          {formattedContent}
        </ReactMarkdown>
      </div>

    </div>
  );
};
