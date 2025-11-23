import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  const renderContent = (text: string) => {
    // Simple parser for basic markdown to avoid external heavy libraries
    // In a real app, use 'react-markdown'
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const key = index;
      const trimmed = line.trim();

      if (!trimmed) {
        elements.push(<div key={key} className="h-4" />); // Spacer
        return;
      }

      // Headers
      if (trimmed.startsWith('### ')) {
        elements.push(<h3 key={key} className="text-xl font-bold mt-4 mb-2 text-black dark:text-white font-serif">{parseInline(trimmed.replace('### ', ''))}</h3>);
      } else if (trimmed.startsWith('## ')) {
        elements.push(<h2 key={key} className="text-2xl font-bold mt-6 mb-3 text-black dark:text-white font-serif">{parseInline(trimmed.replace('## ', ''))}</h2>);
      } else if (trimmed.startsWith('# ')) {
        elements.push(<h1 key={key} className="text-3xl font-bold mt-8 mb-4 text-black dark:text-white font-serif">{parseInline(trimmed.replace('# ', ''))}</h1>);
      }
      // List items
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(
          <li key={key} className="ml-6 list-disc mb-1 text-gray-800 dark:text-gray-300 pl-2">
            {parseInline(trimmed.replace(/^[-*] /, ''))}
          </li>
        );
      }
      // Blockquotes
      else if (trimmed.startsWith('> ')) {
        elements.push(
          <blockquote key={key} className="border-l-4 border-brand-yellow pl-4 italic my-4 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 py-2 pr-2 rounded-r">
            {parseInline(trimmed.replace('> ', ''))}
          </blockquote>
        );
      }
      // Regular Paragraphs
      else {
        elements.push(<p key={key} className="mb-3 text-gray-800 dark:text-gray-300 leading-relaxed text-lg">{parseInline(trimmed)}</p>);
      }
    });

    return elements;
  };

  const parseInline = (text: string): React.ReactNode[] => {
    // Simple inline parser for **bold** and *italic*
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-black dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-sm font-mono text-brand-cyan">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return <div className="markdown-body font-sans">{renderContent(content)}</div>;
};

export default MarkdownRenderer;