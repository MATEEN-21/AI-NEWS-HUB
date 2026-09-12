import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';
import type { UserProfile, SearchResultItem } from './src/types.ts';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve static uploads directory with read-only fallback to /tmp
let uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e: any) {
  uploadsDir = path.resolve(os.tmpdir(), 'ai-tech-hub-uploads');
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (err: any) {
    console.warn('[Storage] Could not create uploads directory in /tmp:', err.message);
  }
}
app.use('/uploads', express.static(uploadsDir));

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  const user = db.validateToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Administrator access required' });
  }

  req.user = user;
  next();
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth status (checks if setup is required or admin is configured)
app.get('/api/auth/status', (req: Request, res: Response) => {
  res.json(db.getAuthStatus());
});

// Admin Setup endpoint (initial configuration)
app.post('/api/auth/setup', (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Admin email and password are required.' });
    }

    const cleanEmail = String(email).trim();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return res.status(400).json({ error: 'Please enter a valid administrative email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match. Please retype carefully.' });
    }

    const currentStatus = db.getAuthStatus();
    if (currentStatus.isConfigured && !currentStatus.requiresSetup) {
      // Check if bearer token is provided to allow existing admin to reconfigure
      const authHeader = req.headers.authorization;
      let isAuthorizedAdmin = false;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const user = db.validateToken(authHeader.split(' ')[1]);
        if (user && user.role === 'admin') isAuthorizedAdmin = true;
      }

      if (!isAuthorizedAdmin) {
        return res.status(400).json({
          error: 'An administrator account is already configured. Please log in or use your emergency recovery key to reset credentials.'
        });
      }
    }

    const result = db.setupAdminAccount(cleanEmail, password);
    return res.status(201).json({
      success: true,
      user: result.user,
      token: result.token,
      recoveryCode: result.recoveryCode,
      message: 'Admin account successfully configured.',
    });
  } catch (err: any) {
    console.error('[Auth Setup] Failed to configure admin account:', err);
    return res.status(500).json({
      error: err.message || 'An unexpected error occurred while setting up the admin account.'
    });
  }
});

// Auth endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const loginId = req.body.email || req.body.username;
  const password = req.body.password;
  if (!loginId || !password) {
    return res.status(400).json({ error: 'Admin Email and Password are required.' });
  }

  const result = db.authenticateUser(loginId, password);
  if (!result) {
    return res.status(401).json({ error: 'Invalid admin credentials. Please check your email and password.' });
  }

  res.json({ user: result.user, token: result.token });
});

app.post('/api/auth/change-password', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  if (confirmNewPassword && newPassword !== confirmNewPassword) {
    return res.status(400).json({ error: 'New passwords do not match.' });
  }

  const result = db.changePassword(req.user!.id, currentPassword, newPassword);
  if (!result.success) {
    return res.status(400).json({ error: result.error || 'Failed to change password.' });
  }

  res.json({ success: true, message: 'Password changed successfully.' });
});

app.get('/api/auth/recovery-code', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const code = db.getRecoveryCode(req.user!.id);
  res.json({ recoveryCode: code });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email, recoveryCode, newPassword, confirmNewPassword } = req.body;
  if (!email || !recoveryCode || !newPassword) {
    return res.status(400).json({ error: 'Admin email, recovery code, and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  if (confirmNewPassword && newPassword !== confirmNewPassword) {
    return res.status(400).json({ error: 'New passwords do not match.' });
  }

  const result = db.resetPassword(email, recoveryCode, newPassword);
  if (!result.success) {
    return res.status(400).json({ error: result.error || 'Failed to reset password.' });
  }

  res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    db.removeSession(authHeader.split(' ')[1]);
  }
  res.json({ success: true });
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

// Articles endpoints
app.get('/api/articles', (req: Request, res: Response) => {
  const { category, tag, search, featured, trending, isNews, limit, includeDrafts } = req.query;

  let canIncludeDrafts = false;
  if (includeDrafts === 'true') {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const user = db.validateToken(authHeader.split(' ')[1]);
      if (user) canIncludeDrafts = true;
    }
  }

  const articles = db.getArticles({
    category: category as string,
    tag: tag as string,
    search: search as string,
    isFeatured: featured === 'true' ? true : featured === 'false' ? false : undefined,
    isTrending: trending === 'true' ? true : trending === 'false' ? false : undefined,
    isNews: isNews === 'true' ? true : isNews === 'false' ? false : undefined,
    includeDrafts: canIncludeDrafts,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });

  res.json(articles);
});

app.get('/api/articles/:slug', (req: Request, res: Response) => {
  const article = db.getArticleBySlug(req.params.slug);
  if (!article) {
    return res.status(404).json({ error: 'Article not found.' });
  }
  res.json(article);
});

app.post('/api/articles', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { title, slug, summary, content, category, tags, author, readingTime, image, isFeatured, isTrending, isDraft, isNews, caption, recommendedTools } = req.body;

  if (!title || !category || !content) {
    return res.status(400).json({ error: 'Title, category, and content are required.' });
  }

  const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newArticle = db.createArticle({
    title,
    slug: generatedSlug,
    summary: summary || '',
    content,
    category,
    tags: Array.isArray(tags) ? tags : [],
    author: author || {
      name: req.user?.name || 'Editorial Staff',
      role: 'Technology Editor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    },
    publishedAt: new Date().toISOString(),
    readingTime: readingTime || `${Math.max(1, Math.ceil(content.split(/\s+/).length / 200))} min read`,
    image: image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    caption: caption || '',
    isFeatured: !!isFeatured,
    isTrending: !!isTrending,
    isDraft: !!isDraft,
    isNews: !!isNews,
    recommendedTools: recommendedTools || [],
  });

  res.status(201).json(newArticle);
});

app.put('/api/articles/:id', requireAuth, (req: Request, res: Response) => {
  const updated = db.updateArticle(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Article not found.' });
  }
  res.json(updated);
});

app.delete('/api/articles/:id', requireAuth, (req: Request, res: Response) => {
  const targetId = req.params.id;
  const success = db.deleteArticle(targetId);
  if (!success) {
    return res.status(404).json({ error: `Article '${targetId}' not found or already deleted.` });
  }
  res.json({ success: true, id: targetId });
});

// AI Tools endpoints
app.get('/api/tools', (req: Request, res: Response) => {
  const { category, search, pricing } = req.query;
  const tools = db.getTools({
    category: category as string,
    search: search as string,
    pricing: pricing as string,
  });
  res.json(tools);
});

app.get('/api/tools/:slug', (req: Request, res: Response) => {
  const tool = db.getToolBySlug(req.params.slug);
  if (!tool) {
    return res.status(404).json({ error: 'Tool not found.' });
  }
  res.json(tool);
});

app.post('/api/tools', requireAuth, (req: Request, res: Response) => {
  const { name, slug, description, category, pricing, websiteUrl, reviewUrl, logoUrl, rating, featured, pricingDetails } = req.body;
  if (!name || !category || !websiteUrl) {
    return res.status(400).json({ error: 'Tool name, category, and website URL are required.' });
  }

  const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newTool = db.createTool({
    name,
    slug: generatedSlug,
    description: description || '',
    category,
    pricing: pricing || 'Free',
    websiteUrl,
    reviewUrl: reviewUrl || '',
    logoUrl: logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=240&q=80',
    rating: rating ? parseFloat(rating) : 4.8,
    featured: !!featured,
    pricingDetails: pricingDetails || '',
  });

  res.status(201).json(newTool);
});

app.put('/api/tools/:id', requireAuth, (req: Request, res: Response) => {
  const updated = db.updateTool(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Tool not found.' });
  }
  res.json(updated);
});

app.delete('/api/tools/:id', requireAuth, (req: Request, res: Response) => {
  const success = db.deleteTool(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Tool not found.' });
  }
  res.json({ success: true });
});

// Categories endpoints
app.get('/api/categories', (req: Request, res: Response) => {
  res.json(db.getCategories());
});

app.post('/api/categories', requireAuth, (req: Request, res: Response) => {
  const { name, slug, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Category name is required.' });
  }
  const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newCat = db.createCategory({
    name,
    slug: generatedSlug,
    description: description || '',
  });
  res.status(201).json(newCat);
});

app.put('/api/categories/:id', requireAuth, (req: Request, res: Response) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Category not found.' });
  }
  res.json(updated);
});

app.delete('/api/categories/:id', requireAuth, (req: Request, res: Response) => {
  const success = db.deleteCategory(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Category not found.' });
  }
  res.json({ success: true });
});

// Tags endpoints
app.get('/api/tags', (req: Request, res: Response) => {
  res.json(db.getTags());
});

app.post('/api/tags', requireAuth, (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Tag name required' });
  const tag = db.addTag(name);
  res.status(201).json(tag);
});

// Media endpoints
app.get('/api/media', requireAuth, (req: Request, res: Response) => {
  res.json(db.getMedia());
});

app.post('/api/media/upload', requireAuth, (req: Request, res: Response) => {
  const { title, dataUrl, url, filename } = req.body;

  if (url) {
    // External URL added to library
    const item = db.addMedia({
      title: title || 'External Image Asset',
      filename: filename || 'external-asset.jpg',
      url,
      size: 150000,
      mimeType: 'image/jpeg',
    });
    return res.status(201).json(item);
  }

  if (dataUrl) {
    try {
      const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Invalid data URL format.' });
      }

      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
      const safeFilename = `${Date.now()}-${(filename || 'image').replace(/[^a-zA-Z0-9_-]/g, '')}.${ext}`;
      let imageUrl = `/uploads/${safeFilename}`;

      try {
        const filePath = path.resolve(uploadsDir, safeFilename);
        fs.writeFileSync(filePath, buffer);
      } catch (writeErr: any) {
        console.warn('[Upload] Disk write failed on read-only system, using dataUrl fallback:', writeErr.message);
        imageUrl = dataUrl;
      }

      const mediaItem = db.addMedia({
        title: title || safeFilename,
        filename: safeFilename,
        url: imageUrl,
        size: buffer.length,
        mimeType,
      });

      return res.status(201).json(mediaItem);
    } catch (err: any) {
      console.error('File upload error:', err);
      return res.status(500).json({ error: 'Failed to process uploaded image.' });
    }
  }

  res.status(400).json({ error: 'Either dataUrl or url is required.' });
});

app.delete('/api/media/:id', requireAuth, (req: Request, res: Response) => {
  const success = db.deleteMedia(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Media not found.' });
  }
  res.json({ success: true });
});

// Universal Search across Articles, News, and AI Tools
app.get('/api/search', (req: Request, res: Response) => {
  const query = ((req.query.q as string) || '').trim().toLowerCase();
  if (!query) {
    return res.json({ results: [], total: 0 });
  }

  const results: SearchResultItem[] = [];

  // Search articles & news
  const articles = db.getArticles({ search: query });
  for (const art of articles) {
    results.push({
      type: art.isNews ? 'news' : 'article',
      id: art.id,
      title: art.title,
      slug: art.slug,
      summary: art.summary,
      category: art.category,
      image: art.image,
      date: art.publishedAt,
      url: `/article/${art.slug}`,
    });
  }

  // Search AI tools
  const tools = db.getTools({ search: query });
  for (const t of tools) {
    results.push({
      type: 'tool',
      id: t.id,
      title: t.name,
      slug: t.slug,
      summary: t.description,
      category: t.category,
      image: t.logoUrl,
      url: `/tools?selected=${t.slug}`,
    });
  }

  res.json({ results, total: results.length });
});

app.get('/api/subscribers', requireAuth, (req: Request, res: Response) => {
  res.json(db.getSubscribers());
});

// Media Replacement & Cascade
app.put('/api/media/:id/replace', requireAuth, (req: Request, res: Response) => {
  const { newUrl, newTitle } = req.body;
  if (!newUrl) {
    return res.status(400).json({ error: 'Replacement image URL is required.' });
  }
  const result = db.replaceMedia(req.params.id, newUrl, newTitle);
  if (!result.success) {
    return res.status(404).json({ error: 'Media asset not found.' });
  }
  res.json(result);
});

// Website Settings
app.get('/api/settings', (req: Request, res: Response) => {
  res.json(db.getSettings());
});

app.put('/api/settings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

// Homepage Configuration
app.get('/api/homepage', (req: Request, res: Response) => {
  res.json(db.getHomepage());
});

app.put('/api/homepage', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateHomepage(req.body);
  res.json(updated);
});

// SEO: robots.txt and sitemap.xml
app.get('/robots.txt', (req: Request, res: Response) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: /sitemap.xml
`);
});

app.get('/sitemap.xml', (req: Request, res: Response) => {
  const articles = db.getArticles();
  const categories = db.getCategories();
  const tools = db.getTools();
  const baseUrl = process.env.APP_URL || 'https://aitechhub.com';

  const urls: string[] = [
    `  <url><loc>${baseUrl}/</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>`,
    `  <url><loc>${baseUrl}/tools</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`,
  ];

  for (const cat of categories) {
    urls.push(`  <url><loc>${baseUrl}/category/${cat.slug}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`);
  }

  for (const art of articles) {
    const lastMod = art.publishedAt ? art.publishedAt.split('T')[0] : '2026-09-08';
    urls.push(`  <url><loc>${baseUrl}/article/${art.slug}</loc><lastmod>${lastMod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`);
  }

  for (const tool of tools) {
    urls.push(`  <url><loc>${baseUrl}/tools?selected=${tool.slug}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  res.type('application/xml');
  res.send(xml);
});

// -------------------------------------------------------------
// VITE MIDDLEWARE & SERVER STARTUP
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Tech Hub server running on http://0.0.0.0:${PORT}`);
  });
}

// Start server if not running inside a serverless runtime
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startServer();
}

export default app;
export { app };
