import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';
import type { Components } from 'react-markdown';

const components: Components = {
  code: CodeBlock as Components['code'],
  table: ({ children }) => (
    <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2.5 text-sm border-t border-gray-100 dark:border-gray-700">
      {children}
    </td>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 space-y-1 my-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 space-y-1 my-2">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-sm leading-relaxed">{children}</li>
  ),
  p: ({ children }) => (
    <p className="my-2 text-sm leading-relaxed">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-indigo-400 dark:border-indigo-500 pl-4 my-3 italic text-gray-600 dark:text-gray-400">
      {children}
    </blockquote>
  ),
  h1: ({ children }) => (
    <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-bold mt-3 mb-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold mt-3 mb-1">{children}</h3>
  ),
  hr: () => <hr className="my-4 border-gray-200 dark:border-gray-700" />,
};

interface AnswerRendererProps {
  markdown: string;
}

export function AnswerRenderer({ markdown }: AnswerRendererProps) {
  return (
    <div className="text-gray-700 dark:text-gray-300">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
