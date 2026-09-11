import React, { useState, useEffect } from 'react';
import { ArrowLeft, SlidersHorizontal, BookOpen } from 'lucide-react';
import { api } from '../services/api.ts';
import type { Article, Category } from '../types.ts';
import { ArticleCard } from '../components/ArticleCard.tsx';
import { CardSkeleton } from '../components/ContentSkeleton.tsx';

interface CategoryPageProps {
  categorySlug: string;
  onNavigate: (path: string) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ categorySlug, onNavigate }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCat, setCurrentCat] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  useEffect(() => {
    async function loadCategoryData() {
      setLoading(true);
      try {
        const [cats, allArticles] = await Promise.all([
          api.getCategories(),
          api.getArticles({ category: categorySlug }),
        ]);
        setCategories(cats);

        const found = cats.find(
          (c) =>
            c.slug.toLowerCase() === categorySlug.toLowerCase() ||
            c.name.toLowerCase().replace(/\s+/g, '-') === categorySlug.toLowerCase()
        );

        setCurrentCat(
          found || {
            id: 'custom',
            name: categorySlug
              .split('-')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' '),
            slug: categorySlug,
            description: `All technical dispatches, research articles, and reports filed under ${categorySlug}.`,
          }
        );

        setArticles(allArticles);
      } catch (err) {
        console.error('Error loading category articles', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryData();
  }, [categorySlug]);

  const sortedArticles = [...articles].sort((a, b) => {
    if (sortBy === 'popular') {
      return (b.views || 0) - (a.views || 0);
    }
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
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
        <span className="text-slate-400">Categories</span>
        <span>/</span>
        <span className="font-semibold text-slate-900">{currentCat?.name || categorySlug}</span>
      </div>

      {/* Category Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 mb-10 relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-block px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-blue-600 text-white mb-3">
            Category Archive
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {currentCat?.name || categorySlug}
          </h1>
          <p className="mt-3 text-slate-300 text-base leading-relaxed">
            {currentCat?.description || 'Browse curated articles, benchmarks, and analyses.'}
          </p>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
        <div className="text-sm text-slate-600 font-medium">
          Showing <span className="font-bold text-slate-900">{sortedArticles.length}</span> published stories
        </div>

        <div className="flex items-center space-x-3">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'latest' | 'popular')}
            className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border-none rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer transition-colors"
          >
            <option value="latest">Newest First</option>
            <option value="popular">Most Read</option>
          </select>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : sortedArticles.length === 0 ? (
        <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No stories filed yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Articles filed under this category will automatically populate here as they are published.
          </p>
          <button
            onClick={() => onNavigate('/')}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Homepage
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              variant="standard"
              onSelect={(slug) => onNavigate(`/article/${slug}`)}
              onSelectCategory={(cat) => onNavigate(`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
