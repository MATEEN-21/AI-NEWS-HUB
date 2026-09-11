import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, TrendingUp, Newspaper, Wrench, BookOpen } from 'lucide-react';
import { api } from '../services/api.ts';
import type { Article, AITool } from '../types.ts';
import { ArticleCard } from '../components/ArticleCard.tsx';
import { ToolCard } from '../components/ToolCard.tsx';
import { HomePageSkeleton } from '../components/ContentSkeleton.tsx';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [tools, setTools] = useState<AITool[]>([]);
  const [homepageConfig, setHomepageConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      try {
        const [fetchedArticles, fetchedTools, fetchedHomepage] = await Promise.all([
          api.getArticles(),
          api.getTools(),
          api.getHomepage().catch(() => null),
        ]);
        setArticles(fetchedArticles);
        setTools(fetchedTools);
        if (fetchedHomepage) {
          setHomepageConfig(fetchedHomepage);
        }
      } catch (err) {
        console.error('Failed to load homepage content', err);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  if (loading) {
    return <HomePageSkeleton />;
  }

  // 1. Featured Section: 1 main hero article + 2-3 smaller featured articles
  // Check if admin configured custom heroArticleId
  const customHero = homepageConfig?.heroArticleId
    ? articles.find((a) => a.id === homepageConfig.heroArticleId)
    : null;
  const featuredArticles = articles.filter((a) => a.isFeatured);
  const heroArticle = customHero || featuredArticles[0] || articles[0];

  // Custom featured articles or fallback
  const customFeaturedPicks = homepageConfig?.featuredArticleIds?.length
    ? homepageConfig.featuredArticleIds
        .map((id: string) => articles.find((a) => a.id === id))
        .filter(Boolean)
    : [];

  const subFeaturedArticles = customFeaturedPicks.length > 0
    ? customFeaturedPicks
    : (featuredArticles.slice(1, 4).length > 0
        ? featuredArticles.slice(1, 4)
        : articles.filter((a) => a.id !== heroArticle?.id).slice(0, 3));

  // 2. Latest AI News
  const aiNewsArticles = articles.filter(
    (a) => a.isNews || a.category.toLowerCase() === 'ai news' || a.category.toLowerCase() === 'tech news'
  ).slice(0, 6);

  // 3. Featured AI Tools
  const customTools = homepageConfig?.featuredToolIds?.length
    ? homepageConfig.featuredToolIds
        .map((id: string) => tools.find((t) => t.id === id))
        .filter(Boolean)
    : [];
  const spotlightTools = customTools.length > 0 ? customTools : tools.slice(0, 6);

  // 4. Latest Articles / Guides
  const latestArticles = articles
    .filter((a) => !a.isNews && a.id !== heroArticle?.id)
    .slice(0, 6);

  // 5. Trending Section
  const trendingArticles = articles.filter((a) => a.isTrending).slice(0, 5);

  const visibleSections = homepageConfig?.visibleSections || {
    featuredIntelligence: true,
    latestNews: true,
    aiTools: true,
    inDepthGuides: true,
    trendingArticles: true,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 animate-fade-in">
      {/* 1. FEATURED INTELLIGENCE SECTION */}
      {visibleSections.featuredIntelligence !== false && (
        <section className="space-y-8">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                Featured Intelligence
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Top Editorial Picks</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Hero Article taking the full container width (col-span-12) */}
            {heroArticle && (
              <div className="col-span-12">
                <ArticleCard
                  article={heroArticle}
                  variant="hero"
                  onSelect={(slug) => onNavigate(`/article/${slug}`)}
                  onSelectCategory={(cat) => onNavigate(`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`)}
                />
              </div>
            )}

            {/* Lower Editorial Picks 3-Column Responsive Grid */}
            {subFeaturedArticles.length > 0 && (
              <div className="col-span-12 pt-8 border-t border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Editorial Spotlight & Field Reports
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Deep-dive perspectives</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {subFeaturedArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      variant="standard"
                      onSelect={(slug) => onNavigate(`/article/${slug}`)}
                      onSelectCategory={(cat) => onNavigate(`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. LATEST AI NEWS SECTION */}
      {visibleSections.latestNews !== false && (
        <section>
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <Newspaper className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Latest AI & Technology News
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/category/ai-news')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center group"
            >
              <span>All AI News</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiNewsArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="standard"
                onSelect={(slug) => onNavigate(`/article/${slug}`)}
                onSelectCategory={(cat) => onNavigate(`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. AI TOOLS SPOTLIGHT SECTION */}
      <section className="bg-slate-50/80 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-10 rounded-2xl border border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Wrench className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Curated Catalog
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                High-Impact AI Tools & Software
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/tools')}
              className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 btn-glow-pulse shadow-sm transition-all self-start sm:self-auto cursor-pointer"
            >
              <span>Explore All Tools Directory</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {spotlightTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onSelectReview={(url) => onNavigate(url)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4 & 5. LATEST ARTICLES + TRENDING ASIDE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left 8 Cols: Latest In-Depth Articles & Guides */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Latest Articles
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/category/ai-guides')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center"
            >
              <span>View More</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {latestArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="standard"
                onSelect={(slug) => onNavigate(`/article/${slug}`)}
                onSelectCategory={(cat) => onNavigate(`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`)}
              />
            ))}
          </div>
        </div>

        {/* Right 4 Cols: Trending List Section */}
        <aside className="lg:col-span-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs sticky top-24">
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                Trending Stories
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {trendingArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  variant="trending"
                  index={index}
                  onSelect={(slug) => onNavigate(`/article/${slug}`)}
                />
              ))}
            </div>

            {/* Subtle editorial card banner */}
            <div className="mt-6 p-4 rounded-lg bg-blue-50/70 border border-blue-100 text-xs">
              <p className="font-bold text-blue-900 mb-1">Peer-Reviewed Research</p>
              <p className="text-blue-700 leading-relaxed">
                All benchmark figures and code recipes are reproduced by AI Tech Hub staff engineers before publication.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};
