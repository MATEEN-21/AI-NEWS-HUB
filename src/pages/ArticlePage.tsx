import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Check,
  Twitter,
  Linkedin,
  Bookmark,
  Eye,
  Loader2,
  Sparkles,
  ExternalLink,
  Wrench,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { Article, AITool } from '../types.ts';
import { ArticleCard } from '../components/ArticleCard.tsx';
import { ToolCard } from '../components/ToolCard.tsx';
import { getSafeImage, getSafeAvatar } from '../utils/image.ts';
import { ArticlePageSkeleton } from '../components/ContentSkeleton.tsx';

interface ArticlePageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const ArticlePage: React.FC<ArticlePageProps> = ({ slug, onNavigate }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [recommendedTools, setRecommendedTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadArticle() {
      setLoading(true);
      try {
        const fetched = await api.getArticle(slug);
        setArticle(fetched);

        // Update document title and Open Graph for SEO
        document.title = `${fetched.title} | AI Tech Hub`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', fetched.summary);

        // Fetch related articles from same category
        const allCategoryArticles = await api.getArticles({
          category: fetched.category,
          limit: 4,
        });
        setRelatedArticles(allCategoryArticles.filter((a) => a.id !== fetched.id).slice(0, 3));

        // Fetch recommended tools if any
        if (fetched.recommendedTools && fetched.recommendedTools.length > 0) {
          const allTools = await api.getTools();
          const tools = allTools.filter((t) => fetched.recommendedTools?.includes(t.id));
          setRecommendedTools(tools);
        } else {
          // Default contextually relevant tools
          const allTools = await api.getTools();
          setRecommendedTools(allTools.slice(0, 2));
        }
      } catch (err) {
        console.error('Failed to load article', err);
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareTwitter = () => {
    if (!article) return;
    const text = encodeURIComponent(`${article.title} - AI Tech Hub`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    if (!article) return;
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  if (loading) {
    return <ArticlePageSkeleton />;
  }

  if (!article) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Article Not Found</h2>
        <p className="text-sm text-slate-600 mb-6">
          The requested technical publication might have been moved or removed.
        </p>
        <button
          onClick={() => onNavigate('/')}
          className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg text-sm"
        >
          Back to Homepage
        </button>
      </div>
    );
  }

  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Simple Markdown parsing for paragraphs, headings, blockquotes, and lists
  const renderFormattedContent = (rawText: string) => {
    const blocks = rawText.split(/\n\n+/);

    return blocks.map((block, idx) => {
      const trimmed = block.trim();

      // Heading 2
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-10 mb-4">
            {trimmed.replace(/^##\s+/, '')}
          </h2>
        );
      }

      // Heading 3
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-8 mb-3">
            {trimmed.replace(/^###\s+/, '')}
          </h3>
        );
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-4 border-blue-600 pl-5 my-6 italic text-slate-700 font-editorial text-xl sm:text-2xl leading-relaxed">
            {trimmed.replace(/^>\s+/, '').replace(/^"|"$/g, '')}
          </blockquote>
        );
      }

      // Code Block
      if (trimmed.startsWith('```')) {
        const codeContent = trimmed.replace(/```[a-z]*\n?|```$/g, '');
        return (
          <pre key={idx} className="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto text-xs sm:text-sm font-mono my-6 border border-slate-800">
            <code>{codeContent}</code>
          </pre>
        );
      }

      // Unordered List
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split(/\n[-*]\s+/).filter(Boolean);
        return (
          <ul key={idx} className="list-disc pl-6 space-y-2 text-slate-800 text-base sm:text-lg my-4">
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^[-*]\s+/, '')}</li>
            ))}
          </ul>
        );
      }

      // Numbered List
      if (/^\d+\.\s+/.test(trimmed)) {
        const items = trimmed.split(/\n\d+\.\s+/).filter(Boolean);
        return (
          <ol key={idx} className="list-decimal pl-6 space-y-2 text-slate-800 text-base sm:text-lg my-4">
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^\d+\.\s+/, '')}</li>
            ))}
          </ol>
        );
      }

      // Default paragraph
      return (
        <p key={idx} className="text-slate-800 text-base sm:text-lg leading-relaxed mb-6 font-normal">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center space-x-2 text-xs text-slate-500">
        <button onClick={() => onNavigate('/')} className="hover:text-blue-600 transition-colors flex items-center">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Home
        </button>
        <span>/</span>
        <button
          onClick={() => onNavigate(`/category/${article.category.toLowerCase().replace(/\s+/g, '-')}`)}
          className="hover:text-blue-600 transition-colors"
        >
          {article.category}
        </button>
      </div>

      {/* Article Header */}
      <header className="mb-8">
        <div className="flex items-center space-x-2 mb-3">
          <button
            onClick={() => onNavigate(`/category/${article.category.toLowerCase().replace(/\s+/g, '-')}`)}
            className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {article.category}
          </button>
          {article.isTrending && (
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
              Trending
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
          {article.title}
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed mb-6">
          {article.summary}
        </p>

        {/* Byline & Metadata Bar */}
        <div className="pt-4 border-t border-b border-slate-100 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <img
              src={getSafeAvatar(article.author?.avatar)}
              alt={article.author?.name || 'Author'}
              className="w-11 h-11 rounded-full object-cover border border-slate-200"
            />
            <div>
              <p className="text-sm font-bold text-slate-900">{article.author?.name || 'Editorial Staff'}</p>
              <p className="text-xs text-slate-500">{article.author?.role || 'Contributor'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-slate-500">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1 text-slate-400" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1 text-slate-400" />
              {article.readingTime}
            </span>
            {article.views !== undefined && (
              <>
                <span>•</span>
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-1 text-slate-400" />
                  {article.views.toLocaleString()} views
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Featured Hero Image */}
      <div className="mb-10 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
        <img
          src={getSafeImage(article.image)}
          alt={article.title}
          className="w-full aspect-16/9 sm:aspect-21/10 object-cover"
        />
        {article.caption && (
          <p className="p-3 text-xs text-center text-slate-500 bg-slate-50 border-t border-slate-100">
            {article.caption}
          </p>
        )}
      </div>

      {/* Main Article Content & Sharing Bar */}
      <div className="relative">
        {/* Floating Share Controls (Desktop left rail / in-content) */}
        <div className="flex items-center justify-between py-4 mb-8 border-y border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2">
              Share Article:
            </span>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Copy share link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
            <button
              onClick={handleShareTwitter}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-600 transition-colors"
              title="Share on X (Twitter)"
            >
              <Twitter className="w-4 h-4" />
            </button>
            <button
              onClick={handleShareLinkedIn}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors"
              title="Share on LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </button>
          </div>

          {/* Tags */}
          <div className="hidden sm:flex items-center space-x-1.5">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Formatted Article Body */}
        <div className="prose-editorial max-w-none">
          {renderFormattedContent(article.content)}
        </div>

        {/* Tags on mobile */}
        <div className="sm:hidden flex flex-wrap gap-1.5 mt-8 pt-4 border-t border-slate-100">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* RECOMMENDED AI TOOLS IN-CONTEXT */}
      {recommendedTools.length > 0 && (
        <section className="mt-14 pt-8 border-t border-slate-200">
          <div className="flex items-center space-x-2 mb-6">
            <Wrench className="w-4 h-4 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Recommended AI Tools Mentioned
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommendedTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onSelectReview={(url) => onNavigate(url)}
              />
            ))}
          </div>
        </section>
      )}

      {/* RELATED ARTICLES */}
      {relatedArticles.length > 0 && (
        <section className="mt-16 pt-10 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <h3 className="text-xl font-bold text-slate-900">
                Related Research & Analysis
              </h3>
            </div>
            <button
              onClick={() => onNavigate(`/category/${article.category.toLowerCase().replace(/\s+/g, '-')}`)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View More in {article.category}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedArticles.map((rel) => (
              <ArticleCard
                key={rel.id}
                article={rel}
                variant="standard"
                onSelect={(s) => onNavigate(`/article/${s}`)}
                onSelectCategory={(c) => onNavigate(`/category/${c.toLowerCase().replace(/\s+/g, '-')}`)}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
