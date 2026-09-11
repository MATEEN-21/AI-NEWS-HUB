import React from 'react';
import { ExternalLink, Star, FileText } from 'lucide-react';
import type { AITool } from '../types.ts';
import { getSafeToolLogo } from '../utils/image.ts';

interface ToolCardProps {
  tool: AITool;
  onSelectReview?: (reviewUrl: string) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelectReview }) => {
  const getPricingBadge = (pricing: string) => {
    switch (pricing) {
      case 'Free':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Freemium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Paid':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Free Trial':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleReviewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (tool.reviewUrl && onSelectReview) {
      onSelectReview(tool.reviewUrl);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 card-hover-lift flex flex-col justify-between h-full">
      <div>
        {/* Top Header with Logo & Badges */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 p-0.5">
              <img
                src={getSafeToolLogo(tool.logoUrl)}
                alt={`${tool.name} logo`}
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=240&q=80';
                }}
              />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-snug hover:text-blue-600 transition-colors">
                {tool.name}
              </h3>
              <span className="inline-block text-xs text-slate-500 font-medium">
                {tool.category}
              </span>
            </div>
          </div>

          <span
            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getPricingBadge(
              tool.pricing
            )}`}
          >
            {tool.pricing}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-3">
          {tool.description}
        </p>

        {tool.pricingDetails && (
          <p className="text-xs text-slate-500 italic mb-4">
            {tool.pricingDetails}
          </p>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center space-x-1 text-amber-500 text-xs font-semibold">
          {tool.rating && (
            <>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{tool.rating.toFixed(1)}</span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {tool.reviewUrl && (
            <button
              onClick={handleReviewClick}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <FileText className="w-3.5 h-3.5 mr-1" />
              Review
            </button>
          )}

          <a
            href={tool.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <span>Visit</span>
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};
