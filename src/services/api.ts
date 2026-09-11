import type { Article, AITool, Category, MediaItem, Tag, UserProfile, SearchResultItem, WebsiteSettings, HomepageConfig, AuthStatus } from '../types.ts';

const BASE_URL = '/api';

export const api = {
  // Public
  async getArticles(params?: {
    category?: string;
    tag?: string;
    search?: string;
    featured?: boolean;
    trending?: boolean;
    isNews?: boolean;
    limit?: number;
    includeDrafts?: boolean;
  }, token?: string | null): Promise<Article[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.tag) query.set('tag', params.tag);
    if (params?.search) query.set('search', params.search);
    if (params?.featured !== undefined) query.set('featured', String(params.featured));
    if (params?.trending !== undefined) query.set('trending', String(params.trending));
    if (params?.isNews !== undefined) query.set('isNews', String(params.isNews));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.includeDrafts) query.set('includeDrafts', 'true');

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/articles?${query.toString()}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch articles');
    return res.json();
  },

  async getArticle(slug: string): Promise<Article> {
    const res = await fetch(`${BASE_URL}/articles/${slug}`);
    if (!res.ok) throw new Error('Article not found');
    return res.json();
  },

  async getTools(params?: { category?: string; search?: string; pricing?: string }): Promise<AITool[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.pricing) query.set('pricing', params.pricing);

    const res = await fetch(`${BASE_URL}/tools?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch tools');
    return res.json();
  },

  async getTool(slug: string): Promise<AITool> {
    const res = await fetch(`${BASE_URL}/tools/${slug}`);
    if (!res.ok) throw new Error('Tool not found');
    return res.json();
  },

  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${BASE_URL}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async getTags(): Promise<Tag[]> {
    const res = await fetch(`${BASE_URL}/tags`);
    if (!res.ok) throw new Error('Failed to fetch tags');
    return res.json();
  },

  async search(q: string): Promise<{ results: SearchResultItem[]; total: number }> {
    const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },

  // Auth Status & Setup
  async getAuthStatus(): Promise<AuthStatus> {
    const res = await fetch(`${BASE_URL}/auth/status`);
    if (!res.ok) throw new Error('Failed to check auth status');
    return res.json();
  },

  async setupAdmin(email: string, pass: string, confirmPass: string): Promise<{ user: UserProfile; token: string; recoveryCode: string }> {
    const res = await fetch(`${BASE_URL}/auth/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass, confirmPassword: confirmPass }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Admin setup failed');
    }
    return res.json();
  },

  // Auth
  async login(loginId: string, pass: string): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginId, password: pass }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Authentication failed');
    }
    return res.json();
  },

  async changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string, token: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to change password');
    }
    return res.json();
  },

  async getRecoveryCode(token: string): Promise<string> {
    const res = await fetch(`${BASE_URL}/auth/recovery-code`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to get recovery code');
    const data = await res.json();
    return data.recoveryCode;
  },

  async resetPassword(email: string, recoveryCode: string, newPassword: string, confirmNewPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, recoveryCode, newPassword, confirmNewPassword }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Password reset failed');
    }
    return res.json();
  },

  async getMe(token: string): Promise<{ user: UserProfile }> {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Invalid or expired token');
    return res.json();
  },

  async logout(token: string): Promise<void> {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Admin Article CRUD
  async createArticle(data: Partial<Article>, token: string): Promise<Article> {
    const res = await fetch(`${BASE_URL}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create article');
    }
    return res.json();
  },

  async updateArticle(id: string, data: Partial<Article>, token: string): Promise<Article> {
    const res = await fetch(`${BASE_URL}/articles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update article');
    }
    return res.json();
  },

  async deleteArticle(id: string, token: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/articles/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete article');
  },

  // Admin Tool CRUD
  async createTool(data: Partial<AITool>, token: string): Promise<AITool> {
    const res = await fetch(`${BASE_URL}/tools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create tool');
    }
    return res.json();
  },

  async updateTool(id: string, data: Partial<AITool>, token: string): Promise<AITool> {
    const res = await fetch(`${BASE_URL}/tools/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update tool');
    }
    return res.json();
  },

  async deleteTool(id: string, token: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/tools/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete tool');
  },

  // Admin Category CRUD
  async createCategory(data: Partial<Category>, token: string): Promise<Category> {
    const res = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create category');
    }
    return res.json();
  },

  async updateCategory(id: string, data: Partial<Category>, token: string): Promise<Category> {
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update category');
    }
    return res.json();
  },

  async deleteCategory(id: string, token: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete category');
  },

  // Admin Media
  async getMedia(token: string): Promise<MediaItem[]> {
    const res = await fetch(`${BASE_URL}/media`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch media');
    return res.json();
  },

  async uploadMedia(payload: { title?: string; dataUrl?: string; url?: string; filename?: string }, token: string): Promise<MediaItem> {
    const res = await fetch(`${BASE_URL}/media/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload media');
    }
    return res.json();
  },

  async deleteMedia(id: string, token: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/media/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete media');
  },

  async replaceMedia(id: string, newUrl: string, newTitle: string | undefined, token: string): Promise<{ success: boolean; media: MediaItem; updatedCount: number }> {
    const res = await fetch(`${BASE_URL}/media/${id}/replace`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newUrl, newTitle }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to replace media asset');
    }
    return res.json();
  },

  // Website Settings
  async getSettings(): Promise<WebsiteSettings> {
    const res = await fetch(`${BASE_URL}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(data: Partial<WebsiteSettings>, token: string): Promise<WebsiteSettings> {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update website settings');
    }
    return res.json();
  },

  // Homepage Configuration
  async getHomepage(): Promise<HomepageConfig> {
    const res = await fetch(`${BASE_URL}/homepage`);
    if (!res.ok) throw new Error('Failed to fetch homepage config');
    return res.json();
  },

  async updateHomepage(data: Partial<HomepageConfig>, token: string): Promise<HomepageConfig> {
    const res = await fetch(`${BASE_URL}/homepage`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update homepage configuration');
    }
    return res.json();
  },

  async getSubscribers(token: string): Promise<{ id: string; email: string; createdAt: string }[]> {
    const res = await fetch(`${BASE_URL}/subscribers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch subscribers');
    return res.json();
  }
};
