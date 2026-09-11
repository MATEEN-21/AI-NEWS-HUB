import React from 'react';

export const HeroCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 flex flex-col lg:flex-row shadow-xs">
      <div className="w-full lg:w-7/12 aspect-16/9 lg:aspect-auto min-h-[260px] lg:min-h-[380px] shimmer" />
      <div className="p-6 sm:p-8 lg:p-10 flex flex-col flex-1 justify-between space-y-6">
        <div className="space-y-4">
          <div className="w-24 h-5 rounded-md shimmer" />
          <div className="w-full h-8 sm:h-10 rounded-lg shimmer" />
          <div className="w-3/4 h-8 sm:h-10 rounded-lg shimmer" />
          <div className="space-y-2 pt-2">
            <div className="w-full h-4 rounded shimmer" />
            <div className="w-5/6 h-4 rounded shimmer" />
            <div className="w-2/3 h-4 rounded shimmer" />
          </div>
        </div>

        <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full shimmer shrink-0" />
            <div className="space-y-1.5">
              <div className="w-24 h-3.5 rounded shimmer" />
              <div className="w-16 h-3 rounded shimmer" />
            </div>
          </div>
          <div className="w-28 h-3.5 rounded shimmer" />
        </div>
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 flex flex-col h-full shadow-xs">
      <div className="aspect-16/10 w-full shimmer" />
      <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="w-20 h-4 rounded shimmer" />
          <div className="w-full h-5 rounded shimmer" />
          <div className="w-4/5 h-5 rounded shimmer" />
          <div className="w-full h-3.5 rounded shimmer pt-1" />
        </div>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full shimmer shrink-0" />
            <div className="w-20 h-3 rounded shimmer" />
          </div>
          <div className="w-16 h-3 rounded shimmer" />
        </div>
      </div>
    </div>
  );
};

export const HomePageSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 animate-pulse">
      {/* Featured Intelligence Skeleton */}
      <section className="space-y-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="w-48 h-5 rounded shimmer" />
          <div className="w-28 h-4 rounded shimmer" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Full-Width Hero Skeleton */}
          <div className="col-span-12">
            <HeroCardSkeleton />
          </div>

          {/* Lower 3-Column Editorial Grid Skeleton */}
          <div className="col-span-12 pt-8 border-t border-slate-200">
            <div className="w-36 h-4 rounded shimmer mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        </div>
      </section>

      {/* Latest AI News Skeleton */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="w-56 h-6 rounded shimmer" />
          <div className="w-24 h-4 rounded shimmer" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </section>
    </div>
  );
};

export const ArticlePageSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      {/* Category and date bar */}
      <div className="flex items-center space-x-3">
        <div className="w-24 h-6 rounded-md shimmer" />
        <div className="w-32 h-4 rounded shimmer" />
      </div>

      {/* Main Title lines */}
      <div className="space-y-3">
        <div className="w-full h-10 sm:h-12 rounded-lg shimmer" />
        <div className="w-3/4 h-10 sm:h-12 rounded-lg shimmer" />
      </div>

      {/* Summary placeholder */}
      <div className="space-y-2 pt-2">
        <div className="w-full h-5 rounded shimmer" />
        <div className="w-5/6 h-5 rounded shimmer" />
      </div>

      {/* Author and stats bar */}
      <div className="py-4 border-t border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-full shimmer" />
          <div className="space-y-1.5">
            <div className="w-28 h-4 rounded shimmer" />
            <div className="w-20 h-3 rounded shimmer" />
          </div>
        </div>
        <div className="w-28 h-4 rounded shimmer" />
      </div>

      {/* Hero featured image skeleton */}
      <div className="w-full aspect-16/9 sm:aspect-21/10 rounded-2xl shimmer" />

      {/* Body paragraphs skeleton */}
      <div className="space-y-4 pt-4">
        <div className="w-full h-4 rounded shimmer" />
        <div className="w-full h-4 rounded shimmer" />
        <div className="w-11/12 h-4 rounded shimmer" />
        <div className="w-4/5 h-4 rounded shimmer" />
        <div className="w-full h-4 rounded shimmer pt-2" />
        <div className="w-5/6 h-4 rounded shimmer" />
      </div>
    </div>
  );
};

export const ToolCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between h-full shadow-xs">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl shimmer shrink-0" />
          <div className="space-y-2 flex-1 min-w-0">
            <div className="w-28 h-4 rounded shimmer" />
            <div className="w-20 h-3 rounded shimmer" />
          </div>
        </div>
        <div className="space-y-2 pt-1">
          <div className="w-full h-3.5 rounded shimmer" />
          <div className="w-5/6 h-3.5 rounded shimmer" />
        </div>
      </div>
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-5">
        <div className="w-16 h-5 rounded shimmer" />
        <div className="w-20 h-4 rounded shimmer" />
      </div>
    </div>
  );
};
