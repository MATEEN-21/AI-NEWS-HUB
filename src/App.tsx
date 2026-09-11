/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { SearchModal } from './components/SearchModal.tsx';
import { InfoModal } from './components/InfoModal.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { CategoryPage } from './pages/CategoryPage.tsx';
import { ArticlePage } from './pages/ArticlePage.tsx';
import { ToolsPage } from './pages/ToolsPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { TopProgressBar } from './components/TopProgressBar.tsx';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [searchOpen, setSearchOpen] = useState(false);
  const [infoModalType, setInfoModalType] = useState<'about' | 'contact' | 'privacy' | 'terms' | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setIsNavigating(true);
      setCurrentPath(window.location.pathname || '/');
      setTimeout(() => setIsNavigating(false), 200);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path === currentPath) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setIsNavigating(true);
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsNavigating(false), 250);
  };

  // Route matching
  const renderCurrentView = () => {
    const path = currentPath;

    if (path === '/admin') {
      return <AdminPage onNavigate={navigate} />;
    }

    if (path.startsWith('/article/')) {
      const slug = path.replace('/article/', '');
      return <ArticlePage slug={slug} onNavigate={navigate} />;
    }

    if (path.startsWith('/category/')) {
      const slug = path.replace('/category/', '');
      return <CategoryPage categorySlug={slug} onNavigate={navigate} />;
    }

    if (path.startsWith('/tools')) {
      const urlParams = new URLSearchParams(window.location.search);
      const catParam = urlParams.get('category');
      return <ToolsPage onNavigate={navigate} initialCategory={catParam} />;
    }

    // Default to Home Page
    return <HomePage onNavigate={navigate} />;
  };

  const isAdminRoute = currentPath === '/admin';

  return (
    <AuthProvider>
      <TopProgressBar isLoading={isNavigating} />

      <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
        {/* Header - hide top editorial ticker inside admin console for clean workspace */}
        {!isAdminRoute && (
          <Header
            currentPath={currentPath}
            onNavigate={navigate}
            onOpenSearch={() => setSearchOpen(true)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1">
          {renderCurrentView()}
        </main>

        {/* Footer */}
        {!isAdminRoute && (
          <Footer
            onNavigate={navigate}
            onOpenInfo={(type) => setInfoModalType(type)}
          />
        )}

        {/* Search Modal */}
        <SearchModal
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          onNavigate={navigate}
        />

        {/* Info & Legal Modals */}
        <InfoModal
          type={infoModalType}
          onClose={() => setInfoModalType(null)}
        />
      </div>
    </AuthProvider>
  );
}
