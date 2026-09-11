import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { Article, AITool, Category, MediaItem, Tag, UserProfile, WebsiteSettings, HomepageConfig } from '../src/types.ts';

interface StoredUser extends UserProfile {
  passwordHash: string;
  salt: string;
}

interface DatabaseSchema {
  isConfigured: boolean;
  recoveryCode?: string;
  users: StoredUser[];
  categories: Category[];
  articles: Article[];
  tools: AITool[];
  media: MediaItem[];
  tags: Tag[];
  subscribers: { id: string; email: string; createdAt: string }[];
  sessions: Record<string, { userId: string; expiresAt: number }>;
  settings: WebsiteSettings;
  homepage: HomepageConfig;
}

export const defaultSettings: WebsiteSettings = {
  siteName: 'AI Tech Hub',
  tagline: 'Frontier Intelligence & Applied AI Architecture',
  logoText: 'AI TECH',
  logoSubText: 'HUB',
  logoUrl: '',
  contactEmail: 'editorial@aitechhub.com',
  contactPhone: '+1 (415) 890-4122',
  editorialAddress: '742 Frontier Way, Suite 400, San Francisco, CA 94107',
  socialLinks: {
    twitter: 'https://twitter.com',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    youtube: 'https://youtube.com',
    discord: 'https://discord.com',
  },
  footerBio: 'An independent technology and artificial intelligence journal delivering rigorous technical analyses, breaking research breakdowns, and unbiased software evaluations.',
  copyrightText: 'AI Tech Hub. All rights reserved.',
  seoTitle: 'AI Tech Hub — Frontier Intelligence & AI Software Directory',
  seoDescription: 'Leading publication covering generative AI, reasoning models, autonomous agents, and curated software benchmarking.',
};

export const defaultHomepage: HomepageConfig = {
  heroArticleId: '',
  featuredSectionTitle: 'Featured Intelligence',
  featuredSectionSubtitle: 'Top Editorial Picks',
  showTrendingTicker: true,
  trendingArticleIds: [],
  showToolsShowcase: true,
  toolsShowcaseTitle: 'Trending Intelligence & Software Directory',
  featuredToolIds: [],
  showNewsletterBox: true,
};

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

const initialCategories: Category[] = [
  { id: 'cat-1', name: 'AI News', slug: 'ai-news', description: 'Breaking dispatches, foundation model releases, and AI industry shifts.' },
  { id: 'cat-2', name: 'Tech News', slug: 'tech-news', description: 'Semiconductor updates, cloud infrastructure, and frontier computing developments.' },
  { id: 'cat-3', name: 'AI Tools', slug: 'ai-tools', description: 'Curated directory and breakdown of cutting-edge artificial intelligence software.' },
  { id: 'cat-4', name: 'Tutorials', slug: 'tutorials', description: 'Step-by-step engineering walk-throughs for developers and practitioners.' },
  { id: 'cat-5', name: 'Reviews', slug: 'reviews', description: 'Rigorous hands-on benchmarking of consumer and enterprise AI technologies.' },
  { id: 'cat-6', name: 'AI Guides', slug: 'ai-guides', description: 'Strategic overviews, implementation frameworks, and best practices.' },
  { id: 'cat-7', name: 'AI Trends', slug: 'ai-trends', description: 'Macro analyses of economic impact, open-source momentum, and future outlooks.' },
];

const initialTags: Tag[] = [
  { id: 'tag-1', name: 'LLMs', slug: 'llms' },
  { id: 'tag-2', name: 'Autonomous Agents', slug: 'autonomous-agents' },
  { id: 'tag-3', name: 'Open Weights', slug: 'open-weights' },
  { id: 'tag-4', name: 'Hardware & Silicon', slug: 'hardware-silicon' },
  { id: 'tag-5', name: 'Reasoning Models', slug: 'reasoning-models' },
  { id: 'tag-6', name: 'Edge AI', slug: 'edge-ai' },
  { id: 'tag-7', name: 'Computer Vision', slug: 'computer-vision' },
  { id: 'tag-8', name: 'Enterprise', slug: 'enterprise' },
];

const initialTools: AITool[] = [
  {
    id: 'tool-cursor',
    name: 'Cursor Editor',
    slug: 'cursor-editor',
    description: 'An intelligent code editor built from VS Code with native agentic code generation, multi-file diffing, and repo indexing.',
    category: 'AI Coding',
    pricing: 'Freemium',
    websiteUrl: 'https://cursor.com',
    reviewUrl: '/article/cursor-ai-code-editor-benchmark-review',
    logoUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=240&q=80',
    rating: 4.9,
    featured: true,
    pricingDetails: 'Free tier with monthly quota, Pro at $20/mo',
  },
  {
    id: 'tool-claude',
    name: 'Claude 3.5 Sonnet',
    slug: 'claude-3-5-sonnet',
    description: 'Leading conversational and reasoning foundation model renowned for nuanced code analysis, system design, and artifact previews.',
    category: 'AI Writing',
    pricing: 'Freemium',
    websiteUrl: 'https://anthropic.com',
    reviewUrl: '/article/frontier-reasoning-models-visual-synthesis-review',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=240&q=80',
    rating: 4.95,
    featured: true,
    pricingDetails: 'Free access on web, $20/mo Pro plan, API per-token',
  },
  {
    id: 'tool-midjourney',
    name: 'Midjourney v6',
    slug: 'midjourney-v6',
    description: 'Photorealistic generative image synthesis engine offering fine typography rendering, camera control, and stylistic consistency.',
    category: 'AI Image',
    pricing: 'Paid',
    websiteUrl: 'https://midjourney.com',
    logoUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=240&q=80',
    rating: 4.8,
    featured: true,
    pricingDetails: 'Subscriptions start at $10/month',
  },
  {
    id: 'tool-elevenlabs',
    name: 'ElevenLabs Voice Engine',
    slug: 'elevenlabs-voice-engine',
    description: 'High-fidelity synthetic speech synthesis platform with emotional inflection, multi-speaker voice cloning, and low-latency streaming.',
    category: 'AI Voice',
    pricing: 'Freemium',
    websiteUrl: 'https://elevenlabs.io',
    logoUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=240&q=80',
    rating: 4.75,
    featured: false,
    pricingDetails: '10,000 characters free monthly, Starter from $5/mo',
  },
  {
    id: 'tool-runway',
    name: 'Runway Gen-3 Alpha',
    slug: 'runway-gen-3-alpha',
    description: 'High-definition video generation model offering cinematic temporal consistency, precise camera motions, and frame interpolation.',
    category: 'AI Video',
    pricing: 'Paid',
    websiteUrl: 'https://runwayml.com',
    logoUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=240&q=80',
    rating: 4.7,
    featured: true,
    pricingDetails: 'Standard tier at $12/mo per user',
  },
  {
    id: 'tool-perplexity',
    name: 'Perplexity Search',
    slug: 'perplexity-search',
    description: 'Conversational answer engine backed by real-time web citations, multi-source synthesis, and academic paper querying.',
    category: 'AI Research',
    pricing: 'Freemium',
    websiteUrl: 'https://perplexity.ai',
    logoUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=240&q=80',
    rating: 4.9,
    featured: true,
    pricingDetails: 'Free unlimited basic search, Pro $20/mo',
  },
  {
    id: 'tool-notion-ai',
    name: 'Notion AI Workspace',
    slug: 'notion-ai-workspace',
    description: 'Integrated knowledge base companion capable of cross-database retrieval, automated summaries, and draft generation.',
    category: 'AI Productivity',
    pricing: 'Free Trial',
    websiteUrl: 'https://notion.so',
    logoUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=240&q=80',
    rating: 4.6,
    featured: false,
    pricingDetails: '$10 per member/month add-on',
  },
];

const initialArticles: Article[] = [
  {
    id: 'art-1',
    title: 'Next-Generation Reasoning Models: How Test-Time Compute is Transforming AI Inference',
    slug: 'next-generation-reasoning-models-test-time-compute',
    summary: 'A deep investigation into how scaling reinforcement learning during inference allows frontier models to verify intermediate thoughts, solve complex proofs, and minimize hallucination.',
    content: `## The Paradigm Shift in Neural Inference

For over five years, the scaling laws of deep learning were governed almost exclusively by pre-training compute. Laboratories invested hundreds of millions of dollars into clustering tens of thousands of GPUs to train increasingly massive parameter models.

However, during recent benchmark evaluations across mathematical synthesis, competitive coding, and multi-step theorem proving, a new dimension of scaling has eclipsed sheer parameter count: **test-time compute**.

### Understanding Test-Time Verification

Rather than spitting out token-by-token completions with a single forward pass, modern reasoning architectures employ iterative chain-of-thought exploration coupled with process reward models (PRMs). 

> "Scaling inference compute allows models to perform internal backtracking, hypothesize test cases, and self-correct before presenting the final answer."

When confronted with an ambiguous query or a rigorous logic problem, the system:
1. **Generates multiple candidate deduction trees** in parallel.
2. **Evaluates validity at each discrete step** rather than evaluating only the final outcome.
3. **Prunes dead-end derivations** and allocates additional computational budget to promising paths.

### Practical Benchmarks & Latency Tradeoffs

While inference latency increases from 350ms to upwards of 8-15 seconds for difficult queries, the accuracy leap is staggering:
- **Olympiad Mathematics:** 84% accuracy improvement over standard one-shot prompting.
- **Formal Code Verification:** 62% reduction in unhandled edge cases during unit test synthesis.
- **Biomedical Paper Synthesis:** 45% decrease in fabricated citations.

### What This Means for Developers

For software architects building production AI applications, the implication is clear: pipeline design must pivot from single-turn API calls to asynchronous reasoning workers. User interfaces should visually convey background deliberation through discreet progress indicators rather than freezing or abruptly streaming unrefined output.`,
    category: 'AI News',
    tags: ['Reasoning Models', 'LLMs', 'Hardware & Silicon'],
    author: {
      name: 'Dr. Sarah Vance',
      role: 'Chief AI Research Editor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    },
    publishedAt: '2026-09-08T10:00:00Z',
    readingTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    caption: 'Visualizing multi-step reasoning pathways within deep transformer networks.',
    isFeatured: true,
    isTrending: true,
    isDraft: false,
    isNews: true,
    views: 14200,
    recommendedTools: ['tool-cursor', 'tool-perplexity'],
  },
  {
    id: 'art-2',
    title: 'Open-Weight Ecosystems in 2026: Can Commodity Hardware Match Proprietary Clouds?',
    slug: 'open-weight-ecosystems-commodity-hardware-match-clouds',
    summary: 'With 4-bit quantization, speculative decoding, and native NPU acceleration, local AI inference on developer workstations is closing the capability gap.',
    content: `## The Democratization of Frontier Weights

The past twelve months have seen unprecedented acceleration in open-weight models. What once required an 8x H100 server rack can now run comfortably on unified-memory laptops equipped with 64GB to 128GB of RAM.

### Architectural Optimizations Driving the Shift

Three pivotal engineering breakthroughs have made local execution viable for enterprise workloads:
- **Grouped-Query Attention (GQA):** Dramatically reduces KV-cache memory footprints, allowing context windows of up to 128k tokens without memory exhaustion.
- **Dynamic 4-Bit ExLlamaV2 and AWQ Kernels:** Retain over 98.4% of FP16 perplexity while slashing memory consumption by a factor of 3.8x.
- **Speculative Drafting:** Utilizing small 1B-parameter draft models to predict tokens validated by the primary 32B model, boosting generation speed to over 45 tokens per second on consumer silicon.

### Privacy and Sovereign Infrastructure

For healthcare providers, defense contractors, and financial analysts, the ability to operate offline without transmitting sensitive telemetry over public clouds provides an insurmountable regulatory advantage.`,
    category: 'AI Trends',
    tags: ['Open Weights', 'Edge AI', 'Enterprise'],
    author: {
      name: 'Elena Rostova',
      role: 'Infrastructure & Hardware Analyst',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80',
    },
    publishedAt: '2026-09-07T14:30:00Z',
    readingTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    caption: 'Compact localized inference engines running on custom silicon boards.',
    isFeatured: true,
    isTrending: true,
    isDraft: false,
    isNews: false,
    views: 9800,
    recommendedTools: ['tool-cursor'],
  },
  {
    id: 'art-3',
    title: 'Cursor AI Code Editor Benchmark Review: Does It Truly 10x Developer Throughput?',
    slug: 'cursor-ai-code-editor-benchmark-review',
    summary: 'We spent four weeks building a production distributed service exclusively inside Cursor. Here is our rigorous breakdown of its context engine, Composer mode, and real-world developer economics.',
    content: `## The Developer Workspace Reimagined

Developer tooling has transitioned from static syntax autocompletion to collaborative agentic software engineering. Cursor, built as a precision fork of VS Code, has emerged as the premier environment for engineers seeking deep repo comprehension.

### Deep Repository Indexing

Unlike standalone web chat assistants, Cursor generates continuous semantic vector embeddings of your entire codebase. When asking questions like *"Where is our Stripe webhook signature verified?"*, the editor pinpoints the exact middleware handler in milliseconds.

### Testing Composer Mode on Real Projects

During our evaluation, we tested Cursor against three challenging engineering tasks:
1. **Refactoring an Express API to Async Generators:** Completed in 3 minutes with zero syntax oversights.
2. **Writing Complex Unit Tests for Concurrent Mutexes:** Generated 14 passing Jest tests covering race conditions.
3. **Database Migration Script Generation:** Correctly extracted schema delta definitions from Drizzle models.

### Verdict: 9.4 / 10

Cursor represents the gold standard of developer AI integration. It respects developer autonomy while eliminating repetitive boilerplate.`,
    category: 'Reviews',
    tags: ['Autonomous Agents', 'LLMs'],
    author: {
      name: 'Marcus Brody',
      role: 'Senior Staff Software Engineer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    },
    publishedAt: '2026-09-06T09:15:00Z',
    readingTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    caption: 'Hands-on evaluation of interactive AI coding environments.',
    isFeatured: true,
    isTrending: true,
    isDraft: false,
    isNews: false,
    views: 18500,
    recommendedTools: ['tool-cursor', 'tool-claude'],
  },
  {
    id: 'art-4',
    title: 'Building Production Agentic RAG Systems: A Step-by-Step Architecture Guide',
    slug: 'building-production-agentic-rag-systems-tutorial',
    summary: 'A hands-on tutorial detailing recursive query decomposition, contextual re-ranking, and self-corrective retrieval loops for high-accuracy enterprise search.',
    content: `## Beyond Naive Vector Search

Naive Retrieval-Augmented Generation (RAG)—chunking text, calculating cosine similarity, and stuffing retrieved chunks into an LLM context window—fails in enterprise deployments. It suffers from context dilution, misplaced ranking, and silence on semantic edge cases.

### The Agentic RAG Architecture

Agentic RAG transforms information retrieval from a one-shot pipeline into an autonomous research loop.

#### Step 1: Query Routing & Decomposition
When a user submits a multi-faceted question:
\`\`\`
"Compare our Q3 gross margins against European compliance directives"
\`\`\`
The agent decomposes this into two discrete parallel searches: financial ledger databases and regulatory compliance documentation.

#### Step 2: Cohere or BGE Cross-Encoder Re-ranking
Vector embeddings approximate broad topical alignment. A cross-encoder neural model scores the top 50 retrieved snippets against the query text directly, discarding 80% of noise.

#### Step 3: Self-Correction & Verification Loop
If the retrieved documents lack sufficient factual support, the agent issues an automated refinement query rather than hallucinating an answer.`,
    category: 'Tutorials',
    tags: ['Autonomous Agents', 'Enterprise', 'LLMs'],
    author: {
      name: 'Marcus Brody',
      role: 'Senior Staff Software Engineer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    },
    publishedAt: '2026-09-05T11:20:00Z',
    readingTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    caption: 'Production-ready architecture diagram for agentic retrieval pipelines.',
    isFeatured: false,
    isTrending: false,
    isDraft: false,
    isNews: false,
    views: 7400,
    recommendedTools: ['tool-perplexity'],
  },
  {
    id: 'art-5',
    title: 'Silicon Giants Unveil 2nm AI Accelerators: Memory Bandwidth Takes Center Stage',
    slug: 'silicon-giants-unveil-2nm-ai-accelerators-memory-bandwidth',
    summary: 'Next-generation semiconductor fabs are moving toward High Bandwidth Memory 4 (HBM4) and optical interconnects to overcome the memory wall.',
    content: `## The Von Neumann Memory Wall

While floating-point matrix arithmetic units have scaled exponentially over the past four years, the real bottleneck of modern deep learning has remained steadfast: memory bandwidth. 

Feeding hundreds of billions of parameters across multi-die packages requires data transfer speeds measuring in tens of terabytes per second.

### The Arrival of Co-Packaged Optics

Leading chip foundries have revealed optical I/O chiplets integrated directly onto the substrate alongside memory stacks. By replacing copper traces with microscopic laser photonic links, interconnect power dissipation drops by 70% while inter-chip throughput expands fivefold.`,
    category: 'Tech News',
    tags: ['Hardware & Silicon', 'Enterprise'],
    author: {
      name: 'Elena Rostova',
      role: 'Infrastructure & Hardware Analyst',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80',
    },
    publishedAt: '2026-09-04T16:00:00Z',
    readingTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    caption: 'Wafer-scale integration and high-bandwidth optical interconnects.',
    isFeatured: false,
    isTrending: false,
    isDraft: false,
    isNews: true,
    views: 6100,
    recommendedTools: [],
  },
  {
    id: 'art-6',
    title: 'Frontier Multimodal Reasoning: Comparing Visual Synthesis Across Flagship Models',
    slug: 'frontier-reasoning-models-visual-synthesis-review',
    summary: 'An exhaustive side-by-side comparison of image comprehension, technical schematic parsing, and OCR precision across the top three multimodal foundations.',
    content: `## Testing the Limits of Multimodal Perception

Can current vision-language models accurately interpret circuit diagrams, surgical pathology scans, and complex geometric puzzles? We designed a rigorous 50-item evaluation benchmark.

### Key Findings:
- **Circuit Schematic Parsing:** High-resolution patch encoders correctly resolved 91% of component pins and bus labels.
- **Handwritten Table Extraction:** Character-level accuracy reached 99.1% across distorted and scanned document formats.
- **Visual Spatial Reasoning:** Tasks requiring counting occluded blocks remain the primary failure mode for non-reasoning architectures.`,
    category: 'Reviews',
    tags: ['Computer Vision', 'Reasoning Models', 'LLMs'],
    author: {
      name: 'Dr. Sarah Vance',
      role: 'Chief AI Research Editor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    },
    publishedAt: '2026-09-03T13:45:00Z',
    readingTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    caption: 'Visual comprehension metrics evaluated against complex technical diagrams.',
    isFeatured: false,
    isTrending: true,
    isDraft: false,
    isNews: false,
    views: 8900,
    recommendedTools: ['tool-claude', 'tool-midjourney'],
  },
  {
    id: 'art-7',
    title: 'The Essential Guide to Small Language Models (SLMs) on Mobile & IoT Devices',
    slug: 'guide-to-small-language-models-mobile-iot',
    summary: 'How sub-3B parameter models are enabling real-time on-device voice transcription, contextual autocomplete, and smart home automation without internet connectivity.',
    content: `## The Rise of Compact Intelligence

While massive models drive cloud intelligence, Small Language Models (SLMs) with 1 billion to 3 billion parameters are quietly redefining mobile and embedded computing.

### Why Small Models Excel at Specialized Tasks
Through aggressive knowledge distillation, high-quality synthetic pre-training data, and pruning, a modern 2B model achieves reasoning capabilities superior to the 70B models of 2023.

### Key Deployment Considerations:
1. **Battery Drain:** Running an unquantized model can deplete 1% battery per minute; INT4 NPU kernels reduce this by 80%.
2. **Thermal Throttling:** Sustained generation must be capped to bursts of 10-15 seconds.
3. **Instant Responsiveness:** Zero network roundtrip enables instantaneous voice interfaces.`,
    category: 'AI Guides',
    tags: ['Edge AI', 'Open Weights'],
    author: {
      name: 'Elena Rostova',
      role: 'Infrastructure & Hardware Analyst',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80',
    },
    publishedAt: '2026-09-02T08:30:00Z',
    readingTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',
    caption: 'Edge intelligence powering low-power mobile microprocessors.',
    isFeatured: false,
    isTrending: false,
    isDraft: false,
    isNews: false,
    views: 5200,
    recommendedTools: [],
  },
  {
    id: 'art-8',
    title: 'Autonomous Software Agents in the Enterprise: Real Deployment Case Studies',
    slug: 'autonomous-software-agents-enterprise-case-studies',
    summary: 'Analyzing how leading tech enterprises are implementing multi-agent workflows for pull request reviews, regression triage, and automated incident response.',
    content: `## From Chatbots to Autonomous Co-Workers

Enterprises are shifting from conversational assistants to goal-directed autonomous agents that hold specific credentials, execute shell commands, query databases, and file bug reports.

### The Multi-Agent Orchestration Pattern
Instead of one generalist agent, top engineering teams employ specialized micro-agents:
- **Triage Agent:** Analyzes Sentry error logs and assigns severity.
- **Diagnostic Agent:** Reproduces stack traces inside sandboxed Docker containers.
- **Patch Agent:** Generates minimal diffs and submits pull requests with regression tests.`,
    category: 'AI News',
    tags: ['Autonomous Agents', 'Enterprise'],
    author: {
      name: 'Dr. Sarah Vance',
      role: 'Chief AI Research Editor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    },
    publishedAt: '2026-09-01T15:00:00Z',
    readingTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    caption: 'Orchestrating autonomous software agents across enterprise infrastructure.',
    isFeatured: false,
    isTrending: true,
    isDraft: false,
    isNews: true,
    views: 11200,
    recommendedTools: ['tool-cursor'],
  }
];

const initialMedia: MediaItem[] = [
  {
    id: 'med-1',
    title: 'Neural Network Concept Visualization',
    filename: 'neural_viz.jpg',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    size: 245000,
    mimeType: 'image/jpeg',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'med-2',
    title: 'Silicon Hardware Board',
    filename: 'silicon_board.jpg',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    size: 312000,
    mimeType: 'image/jpeg',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'med-3',
    title: 'Code Editor Terminal Workspace',
    filename: 'editor_workspace.jpg',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    size: 198000,
    mimeType: 'image/jpeg',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'med-4',
    title: 'Futuristic Network Earth Sphere',
    filename: 'network_sphere.jpg',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    size: 289000,
    mimeType: 'image/jpeg',
    createdAt: '2026-09-01T10:00:00Z',
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirs();
    this.data = this.loadData();
  }

  private ensureDirs() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);

        let changed = false;
        if (!parsed.settings) {
          parsed.settings = { ...defaultSettings };
          changed = true;
        }
        if (!parsed.homepage) {
          parsed.homepage = { ...defaultHomepage };
          changed = true;
        }
        if (parsed.isConfigured === undefined) {
          // If already has user-configured admin with non-default email, mark true, else false
          const hasCustomAdmin = parsed.users?.some((u: StoredUser) => u.email && u.email !== 'editorial@novatechwire.com');
          parsed.isConfigured = hasCustomAdmin;
          changed = true;
        }
        if (!parsed.recoveryCode) {
          parsed.recoveryCode = `ATH-${crypto.randomBytes(3).toString('hex').toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
          changed = true;
        }

        if (changed) {
          this.saveData(parsed);
        }
        return parsed;
      } catch (err) {
        console.error('Failed to parse database.json, reinitializing...', err);
      }
    }

    const defaultData: DatabaseSchema = {
      isConfigured: false,
      recoveryCode: `ATH-${crypto.randomBytes(3).toString('hex').toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      users: [],
      categories: initialCategories,
      articles: initialArticles,
      tools: initialTools,
      media: initialMedia,
      tags: initialTags,
      subscribers: [
        { id: 'sub-1', email: 'reader@technews.io', createdAt: '2026-09-01T12:00:00Z' }
      ],
      sessions: {},
      settings: { ...defaultSettings },
      homepage: { ...defaultHomepage },
    };

    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(data: DatabaseSchema) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  public persist() {
    this.saveData(this.data);
  }

  // User & Auth
  public getAuthStatus(): { isConfigured: boolean; adminEmail?: string; requiresSetup: boolean } {
    const configured = !!this.data.isConfigured && this.data.users.length > 0;
    return {
      isConfigured: configured,
      adminEmail: configured ? this.data.users[0]?.email : undefined,
      requiresSetup: !configured,
    };
  }

  public setupAdminAccount(email: string, pass: string): { user: UserProfile; token: string; recoveryCode: string } {
    const cleanEmail = email.toLowerCase().trim();
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(pass, salt);
    const recoveryCode = `ATH-${crypto.randomBytes(3).toString('hex').toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const adminUser: StoredUser = {
      id: 'user-admin-1',
      username: cleanEmail,
      name: 'Site Administrator',
      email: cleanEmail,
      role: 'admin',
      passwordHash,
      salt,
    };

    this.data.users = [adminUser];
    this.data.isConfigured = true;
    this.data.recoveryCode = recoveryCode;

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7;
    this.data.sessions[token] = { userId: adminUser.id, expiresAt };
    this.persist();

    return {
      user: {
        id: adminUser.id,
        username: adminUser.username,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
      token,
      recoveryCode,
    };
  }

  public authenticateUser(identifier: string, pass: string): { user: UserProfile; token: string } | null {
    const clean = identifier.toLowerCase().trim();
    const user = this.data.users.find(
      u => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
    );
    if (!user) return null;

    const testHash = hashPassword(pass, user.salt);
    if (testHash !== user.passwordHash) return null;

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
    this.data.sessions[token] = { userId: user.id, expiresAt };
    this.persist();

    return {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  public changePassword(userId: string, currentPass: string, newPass: string): { success: boolean; error?: string } {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };

    const verifyCurrent = hashPassword(currentPass, user.salt);
    if (verifyCurrent !== user.passwordHash) {
      return { success: false, error: 'Current password is incorrect' };
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    user.salt = newSalt;
    user.passwordHash = hashPassword(newPass, newSalt);
    this.persist();
    return { success: true };
  }

  public resetPassword(email: string, recoveryCode: string, newPass: string): { success: boolean; error?: string } {
    const clean = email.toLowerCase().trim();
    const user = this.data.users.find(
      u => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
    );
    if (!user) return { success: false, error: 'Admin account not found for this email' };

    const currentCode = this.data.recoveryCode || '';
    if (!currentCode || currentCode.replace(/-/g, '').toLowerCase() !== recoveryCode.replace(/-/g, '').toLowerCase().trim()) {
      return { success: false, error: 'Invalid recovery code. Please check your setup recovery code.' };
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    user.salt = newSalt;
    user.passwordHash = hashPassword(newPass, newSalt);
    this.data.recoveryCode = `ATH-${crypto.randomBytes(3).toString('hex').toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    this.persist();
    return { success: true };
  }

  public getRecoveryCode(userId: string): string | undefined {
    const user = this.data.users.find(u => u.id === userId);
    if (!user || user.role !== 'admin') return undefined;
    return this.data.recoveryCode;
  }

  public validateToken(token: string): UserProfile | null {
    if (!token) return null;
    const session = this.data.sessions[token];
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
      delete this.data.sessions[token];
      this.persist();
      return null;
    }

    const user = this.data.users.find(u => u.id === session.userId);
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  public removeSession(token: string) {
    if (this.data.sessions[token]) {
      delete this.data.sessions[token];
      this.persist();
    }
  }

  // Articles
  public getArticles(options?: {
    category?: string;
    tag?: string;
    search?: string;
    isFeatured?: boolean;
    isTrending?: boolean;
    isNews?: boolean;
    includeDrafts?: boolean;
    limit?: number;
  }): Article[] {
    let list = [...this.data.articles];

    if (!options?.includeDrafts) {
      list = list.filter(a => !a.isDraft);
    }

    if (options?.category) {
      const catQuery = options.category.toLowerCase().replace(/-/g, ' ');
      list = list.filter(a => a.category.toLowerCase() === catQuery || a.category.toLowerCase().replace(/\s+/g, '-') === options.category?.toLowerCase());
    }

    if (options?.tag) {
      const tagQuery = options.tag.toLowerCase();
      list = list.filter(a => a.tags.some(t => t.toLowerCase() === tagQuery));
    }

    if (options?.isFeatured !== undefined) {
      list = list.filter(a => !!a.isFeatured === options.isFeatured);
    }

    if (options?.isTrending !== undefined) {
      list = list.filter(a => !!a.isTrending === options.isTrending);
    }

    if (options?.isNews !== undefined) {
      list = list.filter(a => !!a.isNews === options.isNews);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }

    // Sort by publication date descending
    list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    if (options?.limit && options.limit > 0) {
      list = list.slice(0, options.limit);
    }

    return list;
  }

  public getArticleBySlug(slug: string): Article | null {
    const article = this.data.articles.find(a => a.slug === slug || a.id === slug);
    if (article && !article.isDraft) {
      article.views = (article.views || 0) + 1;
      this.persist();
    }
    return article || null;
  }

  public getArticleById(id: string): Article | null {
    return this.data.articles.find(a => a.id === id) || null;
  }

  public createArticle(articleData: Omit<Article, 'id'>): Article {
    const id = 'art-' + Date.now();
    const newArticle: Article = {
      ...articleData,
      id,
      views: 0,
      publishedAt: articleData.publishedAt || new Date().toISOString(),
    };
    this.data.articles.unshift(newArticle);
    this.persist();
    return newArticle;
  }

  public updateArticle(id: string, updates: Partial<Article>): Article | null {
    const idx = this.data.articles.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.data.articles[idx] = { ...this.data.articles[idx], ...updates, id };
    this.persist();
    return this.data.articles[idx];
  }

  public deleteArticle(idOrSlug: string): boolean {
    const target = (idOrSlug || '').trim();
    if (!target) return false;
    const prevLen = this.data.articles.length;
    this.data.articles = this.data.articles.filter(
      (a) => a.id !== target && a.slug !== target && a.id.trim() !== target
    );
    if (this.data.articles.length !== prevLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // AI Tools
  public getTools(options?: { category?: string; search?: string; pricing?: string }): AITool[] {
    let list = [...this.data.tools];

    if (options?.category && options.category !== 'All') {
      list = list.filter(t => t.category.toLowerCase() === options.category?.toLowerCase());
    }

    if (options?.pricing && options.pricing !== 'All') {
      list = list.filter(t => t.pricing === options.pricing);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }

    return list;
  }

  public getToolBySlug(slug: string): AITool | null {
    return this.data.tools.find(t => t.slug === slug || t.id === slug) || null;
  }

  public createTool(toolData: Omit<AITool, 'id'>): AITool {
    const id = 'tool-' + Date.now();
    const newTool: AITool = { ...toolData, id };
    this.data.tools.unshift(newTool);
    this.persist();
    return newTool;
  }

  public updateTool(id: string, updates: Partial<AITool>): AITool | null {
    const idx = this.data.tools.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.data.tools[idx] = { ...this.data.tools[idx], ...updates, id };
    this.persist();
    return this.data.tools[idx];
  }

  public deleteTool(id: string): boolean {
    const prevLen = this.data.tools.length;
    this.data.tools = this.data.tools.filter(t => t.id !== id);
    if (this.data.tools.length !== prevLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // Categories
  public getCategories(): Category[] {
    // Dynamically calculate counts
    return this.data.categories.map(c => {
      const count = this.data.articles.filter(a => !a.isDraft && (
        a.category.toLowerCase() === c.name.toLowerCase() ||
        a.category.toLowerCase().replace(/\s+/g, '-') === c.slug
      )).length;
      return { ...c, count };
    });
  }

  public createCategory(cat: Omit<Category, 'id'>): Category {
    const id = 'cat-' + Date.now();
    const newCat = { ...cat, id };
    this.data.categories.push(newCat);
    this.persist();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates, id };
    this.persist();
    return this.data.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const prev = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    if (this.data.categories.length !== prev) {
      this.persist();
      return true;
    }
    return false;
  }

  // Media
  public getMedia(): MediaItem[] {
    return [...this.data.media].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addMedia(item: Omit<MediaItem, 'id' | 'createdAt'>): MediaItem {
    const id = 'med-' + Date.now();
    const newMedia: MediaItem = {
      ...item,
      id,
      createdAt: new Date().toISOString(),
    };
    this.data.media.unshift(newMedia);
    this.persist();
    return newMedia;
  }

  public deleteMedia(id: string): boolean {
    const item = this.data.media.find(m => m.id === id);
    if (!item) return false;

    // Delete file from disk if local upload
    if (item.url.startsWith('/uploads/')) {
      const localPath = path.resolve(process.cwd(), 'public', item.url.replace(/^\//, ''));
      if (fs.existsSync(localPath)) {
        try {
          fs.unlinkSync(localPath);
        } catch (err) {
          console.error('Error removing file:', err);
        }
      }
    }

    this.data.media = this.data.media.filter(m => m.id !== id);
    this.persist();
    return true;
  }

  public replaceMedia(id: string, newUrl: string, newTitle?: string): { success: boolean; media?: MediaItem; updatedCount: number } {
    const item = this.data.media.find(m => m.id === id);
    if (!item) return { success: false, updatedCount: 0 };

    const oldUrl = item.url;
    item.url = newUrl;
    if (newTitle) item.title = newTitle;

    let updatedCount = 0;
    // Cascade to articles
    for (const art of this.data.articles) {
      if (art.image === oldUrl) {
        art.image = newUrl;
        updatedCount++;
      }
    }
    // Cascade to tools
    for (const tool of this.data.tools) {
      if (tool.logoUrl === oldUrl) {
        tool.logoUrl = newUrl;
        updatedCount++;
      }
    }
    // Cascade to settings
    if (this.data.settings && this.data.settings.logoUrl === oldUrl) {
      this.data.settings.logoUrl = newUrl;
      updatedCount++;
    }

    this.persist();
    return { success: true, media: item, updatedCount };
  }

  // Website Settings
  public getSettings(): WebsiteSettings {
    return { ...defaultSettings, ...(this.data.settings || {}) };
  }

  public updateSettings(updates: Partial<WebsiteSettings>): WebsiteSettings {
    this.data.settings = {
      ...defaultSettings,
      ...(this.data.settings || {}),
      ...updates,
      socialLinks: {
        ...(this.data.settings?.socialLinks || defaultSettings.socialLinks),
        ...(updates.socialLinks || {}),
      },
    };
    this.persist();
    return this.data.settings;
  }

  // Homepage Management
  public getHomepage(): HomepageConfig {
    return { ...defaultHomepage, ...(this.data.homepage || {}) };
  }

  public updateHomepage(updates: Partial<HomepageConfig>): HomepageConfig {
    this.data.homepage = {
      ...defaultHomepage,
      ...(this.data.homepage || {}),
      ...updates,
    };
    this.persist();
    return this.data.homepage;
  }

  // Tags
  public getTags(): Tag[] {
    return this.data.tags;
  }

  public addTag(name: string): Tag {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = this.data.tags.find(t => t.slug === slug);
    if (existing) return existing;
    const newTag = { id: 'tag-' + Date.now(), name, slug };
    this.data.tags.push(newTag);
    this.persist();
    return newTag;
  }

  // Subscribers
  public addSubscriber(email: string): { success: boolean; message: string } {
    const trimmed = email.toLowerCase().trim();
    if (!trimmed || !trimmed.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    const exists = this.data.subscribers.some(s => s.email === trimmed);
    if (exists) {
      return { success: true, message: 'You are already subscribed to NovaTech Wire.' };
    }
    this.data.subscribers.unshift({
      id: 'sub-' + Date.now(),
      email: trimmed,
      createdAt: new Date().toISOString(),
    });
    this.persist();
    return { success: true, message: 'Thank you for subscribing to NovaTech Wire!' };
  }

  public getSubscribersCount(): number {
    return this.data.subscribers.length;
  }

  public getSubscribers(): { id: string; email: string; createdAt: string }[] {
    return this.data.subscribers;
  }
}

export const db = new Database();
