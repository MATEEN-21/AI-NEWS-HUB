import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Newspaper,
  Wrench,
  FolderTree,
  Image as ImageIcon,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Copy,
  Upload,
  Loader2,
  ArrowLeft,
  Search,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { BrandLogo } from '../components/BrandLogo.tsx';
import { AdminSetupScreen } from '../components/admin/AdminSetupScreen.tsx';
import { AdminLoginScreen } from '../components/admin/AdminLoginScreen.tsx';
import { AdminSecurityCard } from '../components/admin/SettingsTab.tsx';
import { MediaTab } from '../components/admin/MediaTab.tsx';
import type { Article, AITool, Category, MediaItem, ToolCategory, PricingType } from '../types.ts';
import { getSafeImage, getSafeToolLogo, DEFAULT_ARTICLE_IMAGE } from '../utils/image.ts';

interface AdminPageProps {
  onNavigate: (path: string) => void;
}

type TabType = 'articles' | 'news' | 'tools' | 'categories' | 'media' | 'subscribers';

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { user, token, isAdmin, isConfigured, checkAuthStatus, setupAdmin, login, logout, isLoading: authLoading } = useAuth();

  // Search & filter state
  const [articleSearch, setArticleSearch] = useState('');

  // Password Security Modal state
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<TabType>('articles');

  // Data State
  const [articles, setArticles] = useState<Article[]>([]);
  const [tools, setTools] = useState<AITool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [subscribers, setSubscribers] = useState<{ id: string; email: string; createdAt: string }[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modals & Form State
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleForm, setArticleForm] = useState<Partial<Article>>({});
  const [isDraggingArticleImage, setIsDraggingArticleImage] = useState(false);
  const [articleImageFileName, setArticleImageFileName] = useState('');
  const articleFileInputRef = useRef<HTMLInputElement | null>(null);

  const [showToolModal, setShowToolModal] = useState(false);
  const [editingTool, setEditingTool] = useState<AITool | null>(null);
  const [toolForm, setToolForm] = useState<Partial<AITool>>({});

  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState<Partial<Category>>({});

  const [mediaUploadUrl, setMediaUploadUrl] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Load all admin data when token/user is ready
  const loadAdminData = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const [allArts, allTools, allCats, allMedia, allSubs] = await Promise.all([
        api.getArticles({ includeDrafts: true }, token),
        api.getTools(),
        api.getCategories(),
        api.getMedia(token),
        api.getSubscribers(token),
      ]);
      setArticles(allArts);
      setTools(allTools);
      setCategories(allCats);
      setMedia(allMedia);
      setSubscribers(allSubs);
    } catch (err) {
      console.error('Failed to load admin records', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdmin && token) {
      loadAdminData();
    }
  }, [isAdmin, token]);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid admin credentials');
    } finally {
      setLoggingIn(false);
    }
  };

  // -------------------------------------------------------------
  // ARTICLE & NEWS CRUD
  // -------------------------------------------------------------
  const handleProcessArticleImage = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const validExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!validTypes.includes(file.type) && !hasValidExt) {
      notify('Please select a valid image file (.png, .jpg, .jpeg, .webp)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setArticleForm((prev) => ({ ...prev, image: dataUrl }));
      setArticleImageFileName(file.name);
      notify('Image uploaded and ready for article preview.');
    };
    reader.onerror = () => {
      notify('Failed to read selected image file', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleArticleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingArticleImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessArticleImage(file);
    }
  };

  const handleArticleImageDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingArticleImage(true);
  };

  const handleArticleImageDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingArticleImage(false);
  };

  const openNewArticleModal = (isNews = false) => {
    setEditingArticle(null);
    setArticleImageFileName('');
    setArticleForm({
      title: '',
      slug: '',
      category: isNews ? 'AI News' : categories[0]?.name || 'AI News',
      summary: '',
      content: '',
      tags: ['AI', 'Tech'],
      author: {
        name: user?.name || 'Editorial Staff',
        role: 'Senior Technology Editor',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      },
      image: DEFAULT_ARTICLE_IMAGE,
      caption: '',
      publishedAt: new Date().toISOString(),
      readingTime: '5 min read',
      isFeatured: false,
      isTrending: false,
      isDraft: false,
      isNews,
      recommendedTools: [],
    });
    setShowArticleModal(true);
  };

  const openEditArticleModal = (art: Article) => {
    setEditingArticle(art);
    setArticleImageFileName('');
    setArticleForm({
      ...art,
      image: getSafeImage(art.image),
    });
    setShowArticleModal(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const payload = {
      ...articleForm,
      image: getSafeImage(articleForm.image),
    };

    try {
      if (editingArticle) {
        await api.updateArticle(editingArticle.id, payload, token);
        notify('Article updated successfully.');
      } else {
        await api.createArticle(payload, token);
        notify('Article created and published successfully.');
      }
      setShowArticleModal(false);
      await loadAdminData();
    } catch (err: any) {
      notify(err.message || 'Failed to save article', 'error');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!token) return;
    // Immediately remove from local state for instant optimistic UI feedback
    setArticles((prev) => prev.filter((a) => a.id !== id && a.slug !== id));
    try {
      await api.deleteArticle(id, token);
      notify('Item deleted successfully from database.');
      // Refresh in background to ensure sync
      await loadAdminData();
    } catch (err: any) {
      notify(err.message || 'Failed to delete article', 'error');
      await loadAdminData();
    }
  };

  const handleToggleDraft = async (art: Article) => {
    if (!token) return;
    try {
      await api.updateArticle(art.id, { isDraft: !art.isDraft }, token);
      notify(`Article marked as ${!art.isDraft ? 'Draft' : 'Published'}.`);
      await loadAdminData();
    } catch (err: any) {
      notify(err.message || 'Error updating status', 'error');
    }
  };

  // -------------------------------------------------------------
  // TOOLS CRUD
  // -------------------------------------------------------------
  const openNewToolModal = () => {
    setEditingTool(null);
    setToolForm({
      name: '',
      slug: '',
      description: '',
      category: 'AI Coding' as ToolCategory,
      pricing: 'Freemium' as PricingType,
      websiteUrl: 'https://',
      reviewUrl: '',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=240&q=80',
      rating: 4.8,
      featured: false,
      pricingDetails: '',
    });
    setShowToolModal(true);
  };

  const openEditToolModal = (t: AITool) => {
    setEditingTool(t);
    setToolForm({ ...t });
    setShowToolModal(true);
  };

  const handleSaveTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      if (editingTool) {
        await api.updateTool(editingTool.id, toolForm, token);
        notify('AI Tool updated.');
      } else {
        await api.createTool(toolForm, token);
        notify('New AI Tool created.');
      }
      setShowToolModal(false);
      await loadAdminData();
    } catch (err: any) {
      notify(err.message || 'Failed to save tool', 'error');
    }
  };

  const handleDeleteTool = async (id: string) => {
    if (!token) return;
    setTools((prev) => prev.filter((t) => t.id !== id));
    try {
      await api.deleteTool(id, token);
      notify('Tool deleted.');
      await loadAdminData();
    } catch (err: any) {
      notify(err.message || 'Failed to delete tool', 'error');
      await loadAdminData();
    }
  };

  // -------------------------------------------------------------
  // CATEGORIES CRUD
  // -------------------------------------------------------------
  const openNewCategoryModal = () => {
    setEditingCat(null);
    setCatForm({ name: '', slug: '', description: '' });
    setShowCatModal(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCat(cat);
    setCatForm({ ...cat });
    setShowCatModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      if (editingCat) {
        await api.updateCategory(editingCat.id, catForm, token);
        notify('Category updated.');
      } else {
        await api.createCategory(catForm, token);
        notify('New category added.');
      }
      setShowCatModal(false);
      await loadAdminData();
    } catch (err: any) {
      notify(err.message || 'Failed to save category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!token) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    try {
      await api.deleteCategory(id, token);
      notify('Category deleted.');
      await loadAdminData();
    } catch (err: any) {
      notify(err.message || 'Failed to delete category', 'error');
      await loadAdminData();
    }
  };

  // -------------------------------------------------------------
  // MEDIA UPLOAD
  // -------------------------------------------------------------
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploadingMedia(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        await api.uploadMedia(
          {
            title: file.name,
            filename: file.name,
            dataUrl,
          },
          token
        );
        notify('Image successfully uploaded and stored on server.');
        await loadAdminData();
      } catch (err: any) {
        notify(err.message || 'Failed to upload image', 'error');
      } finally {
        setUploadingMedia(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddExternalMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUploadUrl.trim() || !token) return;
    setUploadingMedia(true);
    try {
      await api.uploadMedia({ url: mediaUploadUrl.trim(), title: 'Web Asset' }, token);
      notify('Media asset added to library.');
      setMediaUploadUrl('');
      await loadAdminData();
    } catch (err: any) {
      notify(err.message || 'Failed to add media URL', 'error');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!token) return;
    setMedia((prev) => prev.filter((m) => m.id !== id));
    try {
      await api.deleteMedia(id, token);
      notify('Media asset deleted.');
      await loadAdminData();
    } catch (err: any) {
      notify(err.message || 'Failed to delete media', 'error');
      await loadAdminData();
    }
  };

  const copyMediaUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    notify('Image URL copied to clipboard! Paste into any article.');
  };

  // -------------------------------------------------------------
  // AUTH / SETUP SCREENS
  // -------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // 1. Initial Admin Account Setup (if not yet configured)
  if (!isConfigured) {
    return (
      <AdminSetupScreen
        setupAdmin={setupAdmin}
        onSetupSuccess={async () => {
          await checkAuthStatus();
          await loadAdminData();
        }}
      />
    );
  }

  // 2. Admin Login Screen (if configured but not authenticated)
  if (!isAdmin) {
    return (
      <AdminLoginScreen
        onLogin={login}
        onNavigate={onNavigate}
      />
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  const newsList = articles.filter((a) => a.isNews);
  const regularArticles = articles.filter((a) => !a.isNews);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Admin Top Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <BrandLogo variant="dark" size="sm" />
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-800">
                Editorial CMS
              </span>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4 text-xs">
              <span className="hidden sm:inline text-slate-400">
                Logged in as <strong className="text-white">{user?.name}</strong>
              </span>
              <button
                onClick={() => setShowSecurityModal(true)}
                className="px-3 py-1.5 rounded-lg bg-blue-950/70 hover:bg-blue-900 border border-blue-800/80 text-blue-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
                title="Change Admin Password"
              >
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Change Password</span>
                <span className="sm:hidden">Password</span>
              </button>
              <button
                onClick={() => onNavigate('/')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">View Public Site</span>
                <span className="sm:hidden">Site</span>
              </button>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors flex items-center space-x-1"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Toast Notification Banner */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-xs ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600" />
              )}
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Dashboard Quick Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Articles</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{regularArticles.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">News Items</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{newsList.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Tools</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{tools.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Categories</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{categories.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Media Assets</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{media.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Subscribers</span>
            <p className="text-2xl font-black text-blue-600 mt-1">{subscribers.length}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 space-x-1 sm:space-x-3 mb-8 overflow-x-auto">
          {[
            { id: 'articles', label: 'Articles & Guides', icon: FileText, count: regularArticles.length },
            { id: 'news', label: 'News Items', icon: Newspaper, count: newsList.length },
            { id: 'tools', label: 'AI Tools Directory', icon: Wrench, count: tools.length },
            { id: 'categories', label: 'Categories', icon: FolderTree, count: categories.length },
            { id: 'media', label: 'Media Library', icon: ImageIcon, count: media.length },
            { id: 'subscribers', label: 'Subscribers', icon: Users, count: subscribers.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`pb-3 px-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: ARTICLES */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'articles' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Manage Articles & Guides</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publish, edit, unpublish, and organize editorial articles.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                    placeholder="Search articles..."
                    className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 w-48 sm:w-64"
                  />
                </div>
                <button
                  onClick={() => openNewArticleModal(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 btn-glow-pulse text-white text-xs font-bold rounded-xl shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Article</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Article</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Featured</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {regularArticles
                      .filter((art) =>
                        !articleSearch.trim() ||
                        art.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
                        art.category.toLowerCase().includes(articleSearch.toLowerCase()) ||
                        (art.slug && art.slug.toLowerCase().includes(articleSearch.toLowerCase()))
                      )
                      .map((art) => (
                      <tr key={art.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-900 max-w-md">
                          <div className="flex items-center space-x-3">
                            <img
                              src={getSafeImage(art.image)}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="line-clamp-1 font-bold">{art.title}</p>
                              <p className="text-xs text-slate-400">/{art.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                            {art.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleDraft(art)}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1 ${
                              art.isDraft
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {art.isDraft ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            <span>{art.isDraft ? 'Draft' : 'Published'}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          {art.isFeatured ? (
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              Featured
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(art.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => onNavigate(`/article/${art.slug}`)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Preview on site"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditArticleModal(art)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(art.id)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
                            title="Delete immediately from database"
                            aria-label={`Delete ${art.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: NEWS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Manage Latest AI & Tech News</h2>
              <button
                onClick={() => openNewArticleModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 btn-glow-pulse text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add News Item</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-3 px-4">News Headline</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {newsList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-900 max-w-md">
                          <div className="flex items-center space-x-3">
                            <img
                              src={getSafeImage(item.image)}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="line-clamp-1 font-bold">{item.title}</p>
                              <p className="text-xs text-slate-500 line-clamp-1">{item.summary}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleDraft(item)}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1 ${
                              item.isDraft
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            <span>{item.isDraft ? 'Draft' : 'Published'}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => openEditArticleModal(item)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(item.id)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
                            title="Delete immediately from database"
                            aria-label={`Delete ${item.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: AI TOOLS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Manage AI Tools Directory</h2>
              <button
                onClick={openNewToolModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tool</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Tool Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Pricing</th>
                      <th className="py-3 px-4">Website</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tools.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <div className="flex items-center space-x-3">
                            <img
                              src={getSafeToolLogo(t.logoUrl)}
                              alt=""
                              className="w-9 h-9 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{t.name}</p>
                              <p className="text-xs text-slate-500 line-clamp-1">{t.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                          {t.category}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {t.pricing}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-blue-600">
                          <a href={t.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center hover:underline">
                            <span>Link</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => openEditToolModal(t)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTool(t.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: CATEGORIES */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Manage Publication Categories</h2>
              <button
                onClick={openNewCategoryModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-slate-900 text-base">{cat.name}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {cat.count || 0} stories
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2 font-mono">/category/{cat.slug}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{cat.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onNavigate(`/category/${cat.slug}`)}
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <span>View Category</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </button>
                    <div className="space-x-1">
                      <button
                        onClick={() => openEditCategoryModal(cat)}
                        className="p-1 text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: MEDIA LIBRARY */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'media' && (
          <MediaTab
            media={media}
            token={token!}
            onRefresh={loadAdminData}
            onNotification={(msg, type) => notify(msg, type)}
          />
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 6: SUBSCRIBERS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'subscribers' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Newsletter Subscribers</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active readers subscribed to AI Tech Hub updates.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Subscriber Email</th>
                    <th className="py-3 px-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subscribers.map((sub) => (
                    <tr key={sub.id}>
                      <td className="py-3 px-4 font-mono text-xs text-slate-800">{sub.email}</td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {new Date(sub.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ADMIN SECURITY & PASSWORD CARD (MAIN VIEW) */}
        {/* ------------------------------------------------------------- */}
        <div className="mt-14 pt-8 border-t border-slate-200">
          <AdminSecurityCard
            token={token!}
            onNotification={(msg, type) => notify(msg, type)}
          />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ADMIN SECURITY & PASSWORD MODAL */}
      {/* ------------------------------------------------------------- */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden relative">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>Admin Password Management</span>
              </div>
              <button
                onClick={() => setShowSecurityModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer p-1"
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-6 sm:p-8">
              <AdminSecurityCard
                token={token!}
                className="border-0 p-0 shadow-none"
                onNotification={(msg, type) => {
                  notify(msg, type);
                  if (type === 'success') {
                    setTimeout(() => setShowSecurityModal(false), 1200);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ARTICLE EDIT / CREATE MODAL */}
      {/* ------------------------------------------------------------- */}
      {showArticleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingArticle ? 'Edit Article' : 'Write New Article / News Dispatch'}
              </h3>
              <button
                onClick={() => setShowArticleModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={articleForm.title || ''}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  placeholder="e.g. Next-Generation Reasoning Models..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={articleForm.category || categories[0]?.name}
                    onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={articleForm.slug || ''}
                    onChange={(e) => setArticleForm({ ...articleForm, slug: e.target.value })}
                    placeholder="Leave empty to auto-generate"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Featured Image (Upload / Drag & Drop) *
                </label>

                <input
                  ref={articleFileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProcessArticleImage(file);
                    e.target.value = '';
                  }}
                  className="hidden"
                />

                {articleForm.image && articleForm.image.trim() ? (
                  <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-3.5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="relative w-full sm:w-48 h-28 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                        <img
                          src={getSafeImage(articleForm.image)}
                          alt="Article preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Image Ready
                          </span>
                          {articleImageFileName ? (
                            <span className="text-xs text-slate-600 truncate max-w-xs font-mono font-medium">
                              {articleImageFileName}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">
                              Previewable Data URL loaded
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Converted to previewable format. This image will display directly across public article cards, feeds, and hero headers upon saving.
                        </p>
                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            type="button"
                            onClick={() => articleFileInputRef.current?.click()}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center space-x-1"
                          >
                            <Upload className="w-3.5 h-3.5 mr-1" />
                            <span>Replace Picture</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setArticleForm({ ...articleForm, image: '' });
                              setArticleImageFileName('');
                            }}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors flex items-center space-x-1"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleArticleImageDragOver}
                    onDragLeave={handleArticleImageDragLeave}
                    onDrop={handleArticleImageDrop}
                    onClick={() => articleFileInputRef.current?.click()}
                    className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                      isDraggingArticleImage
                        ? 'border-blue-600 bg-blue-50/80 scale-[1.01]'
                        : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="w-12 h-12 mx-auto mb-2.5 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-bold text-slate-800 mb-0.5">
                      Choose an image or drag & drop here
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                      Supports local picture files: <span className="font-semibold text-slate-600">.png, .jpg, .jpeg, .webp</span>
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        articleFileInputRef.current?.click();
                      }}
                      className="inline-flex items-center text-xs font-semibold text-blue-600 bg-white border border-blue-200 px-3.5 py-1.5 rounded-lg shadow-xs hover:bg-blue-50 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      Browse Local Files
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Summary / Excerpt
                </label>
                <textarea
                  rows={2}
                  value={articleForm.summary || ''}
                  onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })}
                  placeholder="Brief synopsis for card previews and meta descriptions..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Full Article Body (Markdown Supported) *
                </label>
                <textarea
                  rows={8}
                  required
                  value={articleForm.content || ''}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  placeholder="Write story content using ## Headings, > Blockquotes, and bullet points..."
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={articleForm.author?.name || ''}
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        author: { ...(articleForm.author || { avatar: '', role: '' }), name: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={articleForm.tags?.join(', ') || ''}
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                      })
                    }
                    placeholder="LLMs, Reasoning Models, Hardware"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    value={articleForm.publishedAt ? articleForm.publishedAt.split('T')[0] : ''}
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        publishedAt: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString(),
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Image Caption / Credit
                  </label>
                  <input
                    type="text"
                    value={articleForm.caption || ''}
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        caption: e.target.value,
                      })
                    }
                    placeholder="e.g. Visual depiction courtesy of AI Tech Hub Editorial"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!articleForm.isFeatured}
                    onChange={(e) => setArticleForm({ ...articleForm, isFeatured: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Featured Hero Section</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!articleForm.isTrending}
                    onChange={(e) => setArticleForm({ ...articleForm, isTrending: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Mark as Trending</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!articleForm.isNews}
                    onChange={(e) => setArticleForm({ ...articleForm, isNews: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>File as Breaking News</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!articleForm.isDraft}
                    onChange={(e) => setArticleForm({ ...articleForm, isDraft: e.target.checked })}
                    className="rounded text-amber-600"
                  />
                  <span>Save as Draft (Hide from public)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowArticleModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TOOL EDIT / CREATE MODAL */}
      {/* ------------------------------------------------------------- */}
      {showToolModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingTool ? 'Edit AI Tool' : 'Add AI Tool to Directory'}
            </h3>

            <form onSubmit={handleSaveTool} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Tool Name *
                </label>
                <input
                  type="text"
                  required
                  value={toolForm.name || ''}
                  onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })}
                  placeholder="e.g. Cursor Editor"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={toolForm.category || 'AI Coding'}
                    onChange={(e) => setToolForm({ ...toolForm, category: e.target.value as ToolCategory })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                  >
                    {[
                      'AI Writing',
                      'AI Coding',
                      'AI Image',
                      'AI Video',
                      'AI Voice',
                      'AI Productivity',
                      'AI Research',
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Pricing *
                  </label>
                  <select
                    value={toolForm.pricing || 'Freemium'}
                    onChange={(e) => setToolForm({ ...toolForm, pricing: e.target.value as PricingType })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                  >
                    {['Free', 'Freemium', 'Paid', 'Free Trial'].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Website URL *
                </label>
                <input
                  type="url"
                  required
                  value={toolForm.websiteUrl || ''}
                  onChange={(e) => setToolForm({ ...toolForm, websiteUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Logo / Image URL
                </label>
                <input
                  type="url"
                  value={toolForm.logoUrl || ''}
                  onChange={(e) => setToolForm({ ...toolForm, logoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={toolForm.description || ''}
                  onChange={(e) => setToolForm({ ...toolForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Pricing Details
                </label>
                <input
                  type="text"
                  value={toolForm.pricingDetails || ''}
                  onChange={(e) => setToolForm({ ...toolForm, pricingDetails: e.target.value })}
                  placeholder="e.g. Free tier available, Pro at $20/mo"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowToolModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Save Tool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CATEGORY EDIT / CREATE MODAL */}
      {/* ------------------------------------------------------------- */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingCat ? 'Edit Category' : 'Create Category'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={catForm.name || ''}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="e.g. Quantum AI"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={catForm.slug || ''}
                  onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                  placeholder="e.g. quantum-ai"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={catForm.description || ''}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  placeholder="Brief description of stories in this category..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
