import React, { useState } from 'react';
import { Search, Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo.tsx';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate, onOpenSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'AI News', path: '/category/ai-news' },
    { label: 'Tech News', path: '/category/tech-news' },
    { label: 'AI Tools', path: '/tools' },
    { label: 'Articles', path: '/category/ai-guides' },
  ];

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Editorial Ticker Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-600 text-white uppercase tracking-wider">
              Live Wire
            </span>
            <span className="truncate text-slate-300">
              Next-gen reasoning models & open-weight architectures advancing frontier AI
            </span>
          </div>
          <div className="hidden sm:flex items-center space-x-4 text-[11px] text-slate-400">
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNav('/')}
              className="text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
              aria-label="AI Tech Hub Home"
            >
              <BrandLogo variant="light" size="md" />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navItems.map(item => {
              const isActive =
                item.path === '/'
                  ? currentPath === '/'
                  : currentPath.startsWith(item.path);
              return (
                <button
                  key={item.label}
                  onClick={() => handleNav(item.path)}
                  className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/70 font-bold'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm font-medium transition-colors focus:outline-none"
              title="Search AI News, Articles & Tools"
              aria-label="Search"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline text-xs text-slate-500">Search...</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 pt-3 pb-6 space-y-1">
            <button
              onClick={() => {
                onOpenSearch();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium mb-3"
            >
              <span className="flex items-center">
                <Search className="w-4 h-4 mr-2 text-slate-500" />
                Search articles, news & tools...
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            {navItems.map(item => {
              const isActive =
                item.path === '/'
                  ? currentPath === '/'
                  : currentPath.startsWith(item.path);
              return (
                <button
                  key={item.label}
                  onClick={() => handleNav(item.path)}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-800 hover:bg-slate-50 hover:text-blue-600'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
