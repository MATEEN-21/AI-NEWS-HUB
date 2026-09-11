import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Calendar, ArrowRight, Layers, FileText, Wrench, Loader2 } from 'lucide-react';
import { api } from '../services/api.ts';
import type { SearchResultItem } from '../types.ts';
import { getSafeImage } from '../utils/image.ts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'article' | 'news' | 'tool'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search(query.trim());
        setResults(res.results);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredResults = results.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'article') return item.type === 'article';
    if (filter === 'news') return item.type === 'news';
    if (filter === 'tool') return item.type === 'tool';
    return true;
  });

  const handleSelectResult = (url: string) => {
    onNavigate(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center space-x-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search AI news, technical articles, and AI tools..."
            className="w-full text-base font-medium text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          {loading && <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        {query.trim().length > 0 && (
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-medium mr-1">Filter:</span>
            {(['all', 'article', 'news', 'tool'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors capitalize ${
                  filter === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                {tab === 'all' ? 'All Results' : tab === 'tool' ? 'AI Tools' : tab}
              </button>
            ))}
          </div>
        )}

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2.5">
          {!query.trim() && (
            <div className="py-8 text-center text-slate-400 text-sm">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>Type to search across AI Tech Hub's articles, news, and AI tools directory.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
                <span className="text-slate-500">Popular:</span>
                {['Reasoning Models', 'Cursor Editor', 'Open Weights', 'Claude 3.5', 'Agentic RAG'].map(term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() && !loading && filteredResults.length === 0 && (
            <div className="py-8 text-center text-slate-500 text-sm">
              No matching records found for "{query}". Try a different keyword or view our directory.
            </div>
          )}

          {filteredResults.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => handleSelectResult(item.url)}
              className="group cursor-pointer p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-start space-x-3.5"
            >
              {item.image && item.image.trim() ? (
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                  <img src={getSafeImage(item.image)} alt={item.title} className="w-full h-full object-cover" />
                </div>
              ) : null}

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded ${
                      item.type === 'tool'
                        ? 'bg-purple-100 text-purple-700'
                        : item.type === 'news'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {item.type === 'tool' ? 'AI Tool' : item.category}
                  </span>
                  {item.date && (
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-1">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                  {item.summary}
                </p>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0 self-center" />
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{filteredResults.length} matches found</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
