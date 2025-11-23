
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SearchResult } from '../types';
import { searchContent } from '../services/contentService';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus input logic could go here
    } else {
      document.body.style.overflow = 'auto';
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        const data = await searchContent(query);
        setResults(data);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-brand-dark rounded-xl shadow-2xl overflow-hidden border-2 border-brand-yellow animate-fade-in-down">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search articles, pages, or topics..." 
            className="flex-1 bg-transparent text-xl outline-none text-black dark:text-white placeholder-gray-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
             <span className="text-xs font-bold uppercase border border-gray-300 dark:border-gray-600 px-2 py-1 rounded">ESC</span>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
            {loading ? (
                <div className="p-8 text-center text-gray-500">Searching...</div>
            ) : results.length > 0 ? (
                <ul className="space-y-1">
                    {results.map((result, idx) => (
                        <li key={idx}>
                            <Link 
                                to={result.url} 
                                onClick={onClose}
                                className="block p-4 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white ${result.type === 'article' ? 'bg-brand-cyan' : 'bg-brand-yellow !text-black'}`}>
                                        {result.type}
                                    </span>
                                    <h4 className="font-bold text-lg text-black dark:text-white group-hover:underline">{result.title}</h4>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{result.description}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : query ? (
                <div className="p-8 text-center text-gray-500">No results found for "{query}".</div>
            ) : (
                <div className="p-8 text-center text-gray-400">
                    <p className="text-sm">Type to start searching...</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
