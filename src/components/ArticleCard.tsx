import React from 'react';
import { Clock, Calendar, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import type { Article } from '../types.ts';
import { getSafeImage, getSafeAvatar } from '../utils/image.ts';

interface ArticleCardProps {
  article: Article;
  variant?: 'hero' | 'compact' | 'standard' | 'trending' | 'horizontal';
  index?: number;
  onSelect: (slug: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant = 'standard',
  index,
  onSelect,
  onSelectCategory,
}) => {
  const cardImage = getSafeImage(article.image);
  const authorAvatar = getSafeAvatar(article.author?.avatar);

  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectCategory) {
      onSelectCategory(article.category);
    }
  };

  // Hero Main Featured Article (Full Container Width)
  if (variant === 'hero') {
    return (
      <article
        onClick={() => onSelect(article.slug)}
        className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-slate-200 card-hover-lift flex flex-col lg:flex-row h-full shadow-xs"
      >
        <div className="relative aspect-16/9 lg:aspect-auto lg:w-7/12 w-full overflow-hidden bg-slate-100 shrink-0">
          <img
            src={cardImage}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
          />
          <div className="absolute top-4 left-4">
            <button
              onClick={handleCategoryClick}
              className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {article.category}
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10 flex flex-col flex-1 justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lead Editorial Dispatch</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-3.5xl font-extrabold text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
              {article.title}
            </h2>
            <p className="mt-3.5 text-base sm:text-lg text-slate-600 line-clamp-3 lg:line-clamp-4 leading-relaxed">
              {article.summary}
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <img
                src={authorAvatar}
                alt={article.author.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div>
                <p className="text-sm font-bold text-slate-900">{article.author.name}</p>
                <p className="text-xs text-slate-500">{article.author.role}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-500">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {formattedDate}
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {article.readingTime}
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Compact Featured (used in 2-4 sub-featured column next to Hero)
  if (variant === 'compact') {
    return (
      <article
        onClick={() => onSelect(article.slug)}
        className="group cursor-pointer bg-white rounded-xl border border-slate-200 p-4 card-hover-lift-subtle flex flex-col sm:flex-row gap-4"
      >
        <div className="sm:w-36 h-28 shrink-0 rounded-lg overflow-hidden bg-slate-100">
          <img
            src={cardImage}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <button
                onClick={handleCategoryClick}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 tracking-wide uppercase"
              >
                {article.category}
              </button>
              <span className="text-slate-300 text-xs">•</span>
              <span className="text-[11px] text-slate-500">{formattedDate}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
              {article.title}
            </h3>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center">
            <span>By {article.author.name}</span>
            <span className="mx-2">•</span>
            <span>{article.readingTime}</span>
          </div>
        </div>
      </article>
    );
  }

  // Trending (Numbered list style)
  if (variant === 'trending') {
    return (
      <article
        onClick={() => onSelect(article.slug)}
        className="group cursor-pointer py-3.5 flex items-start space-x-4 border-b border-slate-100 last:border-none"
      >
        <div className="text-2xl font-black text-slate-300 group-hover:text-blue-600 transition-colors shrink-0 w-7 text-right">
          {index !== undefined ? String(index + 1).padStart(2, '0') : '•'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 mb-1">
            <span className="font-semibold text-blue-600">{article.category}</span>
            <span>•</span>
            <span>{article.readingTime}</span>
          </div>
          <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h4>
        </div>
      </article>
    );
  }

  // Standard Grid Card
  return (
    <article
      onClick={() => onSelect(article.slug)}
      className="group cursor-pointer bg-white rounded-xl overflow-hidden border border-slate-200 card-hover-lift flex flex-col h-full"
    >
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <img
          src={cardImage}
          alt={article.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <button
            onClick={handleCategoryClick}
            className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-white/95 text-slate-800 shadow-xs hover:bg-blue-600 hover:text-white transition-colors"
          >
            {article.category}
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center text-xs text-slate-500 mb-2 space-x-2">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{article.readingTime}</span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h3>

          <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {article.summary}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-700">{article.author.name}</span>
          <span className="text-blue-600 font-semibold flex items-center group-hover:translate-x-0.5 transition-transform">
            Read Story <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </span>
        </div>
      </div>
    </article>
  );
};
