import React from 'react';
import { ArrowUpRight, Mail, Globe, Layers } from 'lucide-react';
import { BrandLogo } from './BrandLogo.tsx';

interface FooterProps {
  onNavigate: (path: string) => void;
  onOpenInfo: (type: 'about' | 'contact' | 'privacy' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenInfo }) => {

  const categories = [
    { label: 'AI News', path: '/category/ai-news' },
    { label: 'Tech News', path: '/category/tech-news' },
    { label: 'AI Tools', path: '/tools' },
    { label: 'AI Guides', path: '/category/ai-guides' },
    { label: 'AI Trends', path: '/category/ai-trends' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1 & 2: Publication Bio */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => onNavigate('/')}
              className="text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
              aria-label="AI Tech Hub Home"
            >
              <BrandLogo variant="dark" size="md" />
            </button>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              An independent, lightweight technology and artificial intelligence journal delivering rigorous technical analyses, breaking research breakdowns, and unbiased software evaluations.
            </p>
            <div className="pt-2 flex items-center space-x-4 text-xs text-slate-400">
              <span className="flex items-center">
                <Globe className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Global Editorial Syndicate
              </span>
              <span>•</span>
              <span>Published Daily</span>
            </div>
          </div>

          {/* Col 3: Editorial Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Categories
            </h3>
            <ul className="space-y-2 text-sm">
              {categories.map(c => (
                <li key={c.label}>
                  <button
                    onClick={() => onNavigate(c.path)}
                    className="text-slate-400 hover:text-white transition-colors text-left"
                  >
                    {c.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: AI Software & Tools */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Tools & Software
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate('/tools?category=AI+Writing')} className="hover:text-white transition-colors">
                  AI Writing Assistants
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools?category=AI+Coding')} className="hover:text-white transition-colors">
                  AI Coding Environments
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools?category=AI+Image')} className="hover:text-white transition-colors">
                  Generative Image Models
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools?category=AI+Research')} className="hover:text-white transition-colors">
                  Academic & Search Engines
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tools?pricing=Free')} className="hover:text-white transition-colors">
                  Free AI Tools Directory
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Company & Legal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Publication
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => onOpenInfo('about')} className="hover:text-white transition-colors">
                  About AI Tech Hub
                </button>
              </li>
              <li>
                <button onClick={() => onOpenInfo('contact')} className="hover:text-white transition-colors">
                  Editorial Contact
                </button>
              </li>
              <li>
                <button onClick={() => onOpenInfo('privacy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenInfo('terms')} className="hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="hover:text-white transition-colors inline-flex items-center">
                  XML Sitemap <ArrowUpRight className="w-3 h-3 ml-0.5 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Affiliate Notice */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 space-y-4 sm:space-y-0">
          <div>
            &copy; {new Date().getFullYear()} AI Tech Hub. All rights reserved.
          </div>
          <p className="max-w-md text-center sm:text-right text-slate-400">
            AI Tech Hub adheres to strict journalistic standards. We may earn an affiliate commission on select AI tool subscriptions evaluated independently by our editorial desk.
          </p>
        </div>
      </div>
    </footer>
  );
};
