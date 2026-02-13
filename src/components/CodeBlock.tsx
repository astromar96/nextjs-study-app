import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import docker from 'react-syntax-highlighter/dist/esm/languages/prism/docker';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { HTMLAttributes } from 'react';

SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('ts', typescript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('dockerfile', docker);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('css', css);

interface CodeBlockProps extends HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  className?: string;
  node?: unknown;
}

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  if (!match) {
    return (
      <code
        className="bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded text-[0.85em] font-mono"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="my-3 rounded-lg overflow-hidden text-sm">
      <div className="flex items-center justify-between bg-gray-800 dark:bg-gray-900 px-4 py-1.5 text-xs text-gray-400">
        <span>{language}</span>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          fontSize: '0.85rem',
        }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}
