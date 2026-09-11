export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string; // e.g. 'AI News', 'Tech News', 'AI Guides', 'AI Trends'
  tags: string[];
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  readingTime: string;
  image: string;
  caption?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isDraft?: boolean;
  isNews?: boolean;
  views?: number;
  recommendedTools?: string[]; // IDs of recommended tools
}

export type ToolCategory =
  | 'AI Writing'
  | 'AI Image'
  | 'AI Video'
  | 'AI Voice'
  | 'AI Coding'
  | 'AI Productivity'
  | 'AI Research';

export type PricingType = 'Free' | 'Freemium' | 'Paid' | 'Free Trial';

export interface AITool {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ToolCategory;
  pricing: PricingType;
  websiteUrl: string;
  reviewUrl?: string;
  logoUrl: string;
  rating?: number;
  featured?: boolean;
  pricingDetails?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  count?: number;
}

export interface MediaItem {
  id: string;
  title: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
}

export interface SearchResultItem {
  type: 'article' | 'news' | 'tool';
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  image?: string;
  date?: string;
  url: string;
}

export interface WebsiteSettings {
  siteName: string;
  tagline: string;
  logoText: string;
  logoSubText: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  editorialAddress?: string;
  socialLinks: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    youtube?: string;
    discord?: string;
  };
  footerBio: string;
  copyrightText: string;
  seoTitle: string;
  seoDescription: string;
}

export interface HomepageConfig {
  heroArticleId?: string;
  featuredSectionTitle: string;
  featuredSectionSubtitle: string;
  showTrendingTicker: boolean;
  trendingArticleIds?: string[];
  showToolsShowcase: boolean;
  toolsShowcaseTitle: string;
  featuredToolIds?: string[];
  showNewsletterBox: boolean;
}

export interface AuthStatus {
  isConfigured: boolean;
  adminEmail?: string;
  requiresSetup: boolean;
}
