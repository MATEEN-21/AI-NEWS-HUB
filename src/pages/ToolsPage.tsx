import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Wrench, Sparkles, ArrowLeft } from 'lucide-react';
import { api } from '../services/api.ts';
import type { AITool, ToolCategory, PricingType } from '../types.ts';
import { ToolCard } from '../components/ToolCard.tsx';
import { ToolCardSkeleton } from '../components/ContentSkeleton.tsx';

interface ToolsPageProps {
  onNavigate: (path: string) => void;
  initialCategory?: string | null;
}

const CATEGORIES: (ToolCategory | 'All')[] = [
  'All',
  'AI Writing',
  'AI Coding',
  'AI Image',
  'AI Video',
  'AI Voice',
  'AI Productivity',
  'AI Research',
];

const PRICING_OPTIONS: (PricingType | 'All')[] = [
  'All',
  'Free',
  'Freemium',
  'Paid',
  'Free Trial',
];

export const ToolsPage: React.FC<ToolsPageProps> = ({ onNavigate, initialCategory }) => {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [selectedPricing, setSelectedPricing] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function loadTools() {
      setLoading(true);
      try {
        const fetched = await api.getTools();
        setTools(fetched);
      } catch (err) {
        console.error('Failed to load AI tools', err);
      } finally {
        setLoading(false);
      }
    }
    loadTools();
  }, []);

  const filteredTools = tools.filter((tool) => {
    // Category match
    if (selectedCategory !== 'All' && tool.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    // Pricing match
    if (selectedPricing !== 'All' && tool.pricing !== selectedPricing) {
      return false;
    }
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center space-x-2 text-xs text-slate-500">
        <button onClick={() => onNavigate('/')} className="hover:text-blue-600 transition-colors flex items-center">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Home
        </button>
        <span>/</span>
        <span className="font-semibold text-slate-900">AI Tools Directory</span>
      </div>

      {/* Hero Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 mb-10 relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-blue-600 text-white mb-3">
            <Wrench className="w-3.5 h-3.5 mr-1" />
            <span>Curated Software Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Vetted Artificial Intelligence Tools
          </h1>
          <p className="mt-3 text-slate-300 text-base leading-relaxed">
            Discover, evaluate, and compare production-grade AI software across writing, coding, vision, and enterprise research.
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-8 shadow-xs space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search AI tools by name, description, or capability..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Category Pills */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Categories
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Filter Pills */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2">
            Pricing Model:
          </span>
          {PRICING_OPTIONS.map((pricing) => (
            <button
              key={pricing}
              onClick={() => setSelectedPricing(pricing)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedPricing === pricing
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {pricing}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Count Summary */}
      <div className="flex items-center justify-between mb-6 text-sm text-slate-600">
        <span>
          Showing <strong className="text-slate-900">{filteredTools.length}</strong> AI tools
        </span>
        {(selectedCategory !== 'All' || selectedPricing !== 'All' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedPricing('All');
              setSearchQuery('');
            }}
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Grid of Tools */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <ToolCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <Wrench className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No AI tools matched your filters</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Try choosing "All" categories or clearing your search term.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedPricing('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onSelectReview={(url) => onNavigate(url)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
