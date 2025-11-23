
import { Article, PageConfig, Comment, Poll, PrintEdition, TeamMember, GalleryAlbum, Video, Notification, ContactMessage, SystemConfig, SearchResult, SchoolEvent, ArticleReactions, AccessLog, ArticleReport } from '../types';

// --- Local Storage Helpers ---
const STORAGE_KEYS = {
  SYSTEM: 'tl_system_config',
  LOGS: 'tl_access_logs',
  PAGES: 'tl_pages',
  ARTICLES: 'tl_articles',
  REPORTS: 'tl_reports',
  MESSAGES: 'tl_messages',
  NOTIFS: 'tl_notifications',
  COMMENTS: 'tl_comments',
  POLL: 'tl_active_poll',
  EVENTS: 'tl_events',
  SUBSCRIBERS: 'tl_subscribers'
};

const loadData = <T>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (e) {
    console.error(`Failed to load ${key}`, e);
    return fallback;
  }
};

const saveData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key}`, e);
  }
};

// --- Initial Data Sets (Fallbacks) ---

const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  maintenanceMode: false,
  allowGuestSignup: true,
  theme: {
    publicationName: "THE LIGHT",
    publicationSubtext: "Publication",
    logoUrl: "https://i.imgur.com/WhsJ3hf.jpeg",
    primaryColor: "#FFEB3B",
    accentColor: "#00BCD4"
  },
  breakingNews: {
    enabled: true,
    text: "CLASSES SUSPENDED: Due to severe weather conditions, all classes are suspended for tomorrow, Oct 25.",
    link: "/category/news",
    bgColor: '#DC2626', 
    textColor: '#FFFFFF',
    speed: 'normal'
  }
};

const DEFAULT_PAGES: PageConfig[] = [
  { id: '1', title: 'Editorial', slug: 'editorial', type: 'category', description: 'Opinions and official stances.', isSystem: true, isVisible: true, accessLevel: 'public', orderScore: 1 },
  { id: '2', title: 'News', slug: 'news', type: 'category', description: 'Latest happenings around campus.', isSystem: true, isVisible: true, accessLevel: 'public', orderScore: 2 },
  { id: '3', title: 'Features', slug: 'features', type: 'category', description: 'Deep dives and stories.', isSystem: true, isVisible: true, accessLevel: 'public', orderScore: 3 },
  { id: '4', title: 'Sports', slug: 'sports', type: 'category', description: 'Athletics updates.', isSystem: true, isVisible: true, accessLevel: 'public', orderScore: 4 },
  { id: '5', title: 'Sci-Tech', slug: 'sci-tech', type: 'category', description: 'Science and Technology.', isSystem: false, isVisible: true, accessLevel: 'public', orderScore: 5 },
  { id: '6', title: 'Literary', slug: 'literary', type: 'category', description: 'Poems and Stories.', isSystem: false, isVisible: true, accessLevel: 'public', orderScore: 6 },
  { id: '7', title: 'Gallery', slug: 'gallery', type: 'static', description: 'Photo collections.', isSystem: true, isVisible: true, accessLevel: 'public', orderScore: 7 },
  { id: '8', title: 'Videos', slug: 'videos', type: 'static', description: 'Video library.', isSystem: true, isVisible: true, accessLevel: 'public', orderScore: 8 },
  { id: '9', title: 'Events', slug: 'events', type: 'static', description: 'School calendar.', isSystem: true, isVisible: true, accessLevel: 'public', orderScore: 9 },
  { id: '10', title: 'About', slug: 'about', type: 'static', description: 'About the publication.', isSystem: true, isVisible: true, accessLevel: 'public', orderScore: 10 },
  { id: '11', title: 'Contact', slug: 'contact', type: 'static', description: 'Contact us.', isSystem: true, isVisible: true, accessLevel: 'public', orderScore: 11 },
];

const DEFAULT_ARTICLES: Article[] = [
  {
    id: '101',
    title: 'The Light Shines Brighter: Annual Journalism Press Conference',
    slug: 'light-shines-brighter',
    excerpt: 'Our team took home 5 gold medals in this years regional press conference.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    authorId: '4',
    authorName: 'Jimmy Pen',
    categorySlug: 'news',
    imageUrl: 'https://picsum.photos/800/600?random=1',
    publishedAt: new Date().toISOString(),
    status: 'published',
    views: 120,
    reactions: { like: 15, love: 5, insightful: 2, sad: 0 },
    isMemberOnly: false,
    isFeatured: true
  },
  {
    id: '102',
    title: 'Why We Need Longer Breaks',
    slug: 'why-we-need-longer-breaks',
    excerpt: 'An analysis on student productivity and rest periods.',
    content: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. This is exclusive content that goes deep into the psychology of rest. The students have spoken, and the data shows a clear correlation between rest and performance. When we look at the charts... (content continues)',
    authorId: '2',
    authorName: 'Jane EIC',
    categorySlug: 'editorial',
    imageUrl: 'https://picsum.photos/800/600?random=2',
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'published',
    views: 85,
    reactions: { like: 10, love: 20, insightful: 45, sad: 1 },
    isMemberOnly: true, 
    isFeatured: false
  },
  {
    id: '103',
    title: 'Varsity Team Qualifies for Finals',
    slug: 'varsity-finals',
    excerpt: 'The basketball team secured a thriller victory yesterday.',
    content: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. \n\nWatch the highlights below!',
    authorId: '4',
    authorName: 'Jimmy Pen',
    categorySlug: 'sports',
    imageUrl: 'https://picsum.photos/800/600?random=3',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', 
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    status: 'published',
    views: 200,
    reactions: { like: 50, love: 10, insightful: 2, sad: 0 },
    isMemberOnly: false,
    isFeatured: false
  },
  {
    id: '104',
    title: 'New Science Lab Equipment Arrives',
    slug: 'new-science-lab',
    excerpt: 'The school has invested in state-of-the-art microscopes and chemistry sets.',
    content: 'The science department is thrilled to announce the arrival of new equipment. This upgrade will allow students to perform more advanced experiments. "It is a game changer," says Mr. Alchemist.',
    authorId: '4',
    authorName: 'Jimmy Pen',
    categorySlug: 'sci-tech',
    imageUrl: 'https://picsum.photos/800/600?random=4',
    publishedAt: new Date(Date.now() - 200000000).toISOString(),
    status: 'published',
    views: 56,
    reactions: { like: 5, love: 1, insightful: 12, sad: 0 },
    isMemberOnly: false,
    isFeatured: false
  },
  {
    id: '201',
    title: 'Draft: Canteen Prices Rising',
    slug: 'draft-canteen-prices',
    excerpt: 'Students are complaining about the recent price hike.',
    content: 'Prices for meals have gone up by 20%. We investigate why.',
    authorId: '4',
    authorName: 'Jimmy Pen',
    categorySlug: 'news',
    imageUrl: 'https://picsum.photos/800/600?random=50',
    publishedAt: new Date().toISOString(),
    status: 'draft',
    views: 0,
    reactions: { like: 0, love: 0, insightful: 0, sad: 0 },
    isMemberOnly: false
  },
  {
    id: '202',
    title: 'Pending: Interview with the Principal',
    slug: 'pending-principal-interview',
    excerpt: 'We sat down with Dr. Smith to discuss the new policies.',
    content: 'Dr. Smith emphasized the importance of discipline and academic excellence.',
    authorId: '4',
    authorName: 'Jimmy Pen',
    categorySlug: 'features',
    imageUrl: 'https://picsum.photos/800/600?random=51',
    publishedAt: new Date().toISOString(),
    status: 'pending',
    views: 0,
    reactions: { like: 0, love: 0, insightful: 0, sad: 0 },
    isMemberOnly: true
  }
];

const DEFAULT_EVENTS: SchoolEvent[] = [
    { 
      id: '1', 
      title: 'Foundation Week: Day 1', 
      date: '2024-03-15', 
      location: 'University Grounds', 
      category: 'General', 
      status: 'scheduled',
      description: 'The start of our university week celebration.', 
      imageUrl: 'https://picsum.photos/600/400?random=90',
      subEvents: [
        { id: 's1', time: '07:30 AM', title: 'Grand Parade', location: 'Oval' },
        { id: 's2', time: '09:00 AM', title: 'Opening Ceremony', location: 'Gymnasium' },
        { id: 's3', time: '01:00 PM', title: 'Food Bazaar Opening', location: 'Quadrangle' },
      ]
    },
    { 
      id: '2', 
      title: 'Science Fair Judging', 
      date: '2024-03-15', 
      location: 'Science Lab', 
      category: 'Academic', 
      status: 'scheduled',
      description: 'Showcase of student innovation.', 
    },
    { 
      id: '3', 
      title: 'Varsity Finals vs Rivals', 
      date: '2024-03-20', 
      location: 'City Arena', 
      category: 'Sports', 
      status: 'scheduled',
      description: 'Championship game.', 
      imageUrl: 'https://picsum.photos/600/400?random=91' 
    },
    { 
      id: '4', 
      title: 'Spring Concert', 
      date: '2024-04-05', 
      location: 'Auditorium', 
      category: 'Arts', 
      status: 'cancelled',
      description: 'Featuring the school choir and band.', 
      imageUrl: 'https://picsum.photos/600/400?random=92' 
    },
];

const DEFAULT_POLL: Poll = {
  id: 'poll-1',
  question: 'What is the most anticipated event this semester?',
  totalVotes: 142,
  options: [
    { id: 'opt-1', text: 'Intramurals', votes: 85 },
    { id: 'opt-2', text: 'Science Fair', votes: 20 },
    { id: 'opt-3', text: 'School Concert', votes: 37 }
  ]
};

// --- Active Data (Loaded from Storage) ---

let SYSTEM_CONFIG = loadData<SystemConfig>(STORAGE_KEYS.SYSTEM, DEFAULT_SYSTEM_CONFIG);
let ACCESS_LOGS = loadData<AccessLog[]>(STORAGE_KEYS.LOGS, []);
let PAGES = loadData<PageConfig[]>(STORAGE_KEYS.PAGES, DEFAULT_PAGES);
let ARTICLES = loadData<Article[]>(STORAGE_KEYS.ARTICLES, DEFAULT_ARTICLES);
let REPORTS = loadData<ArticleReport[]>(STORAGE_KEYS.REPORTS, []);
let CONTACT_MESSAGES = loadData<ContactMessage[]>(STORAGE_KEYS.MESSAGES, []);
let NOTIFICATIONS = loadData<Notification[]>(STORAGE_KEYS.NOTIFS, []);
let COMMENTS = loadData<Comment[]>(STORAGE_KEYS.COMMENTS, []);
let ACTIVE_POLL = loadData<Poll>(STORAGE_KEYS.POLL, DEFAULT_POLL);
let SCHOOL_EVENTS = loadData<SchoolEvent[]>(STORAGE_KEYS.EVENTS, DEFAULT_EVENTS);
let SUBSCRIBERS = loadData<string[]>(STORAGE_KEYS.SUBSCRIBERS, []);

// Static Data (No need to persist for this demo, or can be added later)
let PRINT_EDITIONS: PrintEdition[] = [
  { 
      id: '1', 
      title: 'The Light: Volume 24', 
      coverUrl: 'https://picsum.photos/400/600?random=10', 
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 
      publishDate: '2023-12-01', 
      volume: 'Vol. 24 Issue 2' 
  },
];

let TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Dr. Alan Grant', role: 'Faculty Adviser', bio: 'Guiding students in ethical journalism.', avatarUrl: 'https://i.pravatar.cc/150?u=grant', email: 'grant@light.edu', socialLinks: { twitter: '@dgrant' } },
  { id: '2', name: 'Jane EIC', role: 'Editor-in-Chief', bio: 'Senior student passionate about truth and storytelling.', avatarUrl: 'https://i.pravatar.cc/150?u=eic', email: 'eic@light.edu' },
  { id: '3', name: 'John Head', role: 'Sports Editor', bio: 'Capturing the thrill of the game.', avatarUrl: 'https://i.pravatar.cc/150?u=head', email: 'head@light.edu' },
  { id: '4', name: 'Jimmy Pen', role: 'Senior Journalist', bio: 'Aspiring writer and coffee enthusiast.', avatarUrl: 'https://i.pravatar.cc/150?u=writer', email: 'writer@light.edu' },
  { id: '5', name: 'Alice Lens', role: 'Head Photographer', bio: 'Visualizing the narrative.', avatarUrl: 'https://i.pravatar.cc/150?u=lens' },
];

let ALBUMS: GalleryAlbum[] = [
  { id: '1', title: 'Intramurals 2024', coverUrl: 'https://picsum.photos/800/600?random=20', imageCount: 45, images: Array(6).fill('https://picsum.photos/800/600?random=21') },
];

let VIDEOS: Video[] = [
  { id: '1', title: 'Campus Tour 2024', description: 'A walk through our newly renovated campus.', thumbnailUrl: 'https://picsum.photos/800/450?random=30', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'Features', publishedAt: '2023-10-15' },
];


// --- Logging Service ---

export const logUserActivity = async (
    action: AccessLog['action'], 
    details: string, 
    user?: { id: string, name: string }
): Promise<void> => {
    const log: AccessLog = {
        id: Date.now().toString(),
        userId: user?.id,
        userName: user?.name || 'Guest',
        action,
        details,
        timestamp: new Date().toISOString()
    };
    ACCESS_LOGS.unshift(log);
    // Keep only last 200 logs
    if (ACCESS_LOGS.length > 200) ACCESS_LOGS.pop();
    saveData(STORAGE_KEYS.LOGS, ACCESS_LOGS);
};

export const getAccessLogs = async (): Promise<AccessLog[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...ACCESS_LOGS];
};

// --- System & Config Functions ---

export const getSystemConfig = async (): Promise<SystemConfig> => {
    return { ...SYSTEM_CONFIG };
};

export const updateSystemConfig = async (config: Partial<SystemConfig>): Promise<SystemConfig> => {
    SYSTEM_CONFIG = { ...SYSTEM_CONFIG, ...config };
    saveData(STORAGE_KEYS.SYSTEM, SYSTEM_CONFIG);
    await logUserActivity('SYSTEM_CHANGE', 'Updated system configuration or theme.');
    return SYSTEM_CONFIG;
};

// --- Page Functions ---

export const getPages = async (): Promise<PageConfig[]> => {
  await new Promise(resolve => setTimeout(resolve, 300)); 
  return PAGES.sort((a,b) => a.orderScore - b.orderScore);
};

export const createPage = async (page: PageConfig): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  PAGES.push(page);
  saveData(STORAGE_KEYS.PAGES, PAGES);
};

export const updatePage = async (id: string, updates: Partial<PageConfig>): Promise<void> => {
    const idx = PAGES.findIndex(p => p.id === id);
    if(idx !== -1) {
        PAGES[idx] = { ...PAGES[idx], ...updates };
        saveData(STORAGE_KEYS.PAGES, PAGES);
    }
};

export const deletePage = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  PAGES = PAGES.filter(p => p.id !== id);
  saveData(STORAGE_KEYS.PAGES, PAGES);
};

// --- Article Functions ---

export const getArticles = async (categorySlug?: string): Promise<Article[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  let result = ARTICLES.filter(a => a.status === 'published');
  
  if (categorySlug) {
    result = result.filter(a => a.categorySlug === categorySlug);
  }
  
  // Sort descending by date (Newest First)
  return result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
};

// Admin function to get everything
export const getAllArticles = async (): Promise<Article[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...ARTICLES].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export const getArticlesByAuthor = async (authorId: string): Promise<Article[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return ARTICLES.filter(a => a.authorId === authorId && a.status !== 'archived');
};

export const getPendingArticles = async (): Promise<Article[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return ARTICLES.filter(a => a.status === 'pending');
};

export const getArticleBySlug = async (slug: string): Promise<Article | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return ARTICLES.find(a => a.slug === slug);
};

export const getRelatedArticles = async (currentArticleId: string, categorySlug: string): Promise<Article[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return ARTICLES
    .filter(a => a.categorySlug === categorySlug && a.id !== currentArticleId && a.status === 'published')
    .slice(0, 4);
};

export const incrementViews = async (articleId: string): Promise<void> => {
  const index = ARTICLES.findIndex(a => a.id === articleId);
  if (index !== -1) {
    ARTICLES[index].views += 1;
    saveData(STORAGE_KEYS.ARTICLES, ARTICLES);
  }
};

export const reactToArticle = async (articleId: string, reaction: keyof ArticleReactions): Promise<ArticleReactions | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const index = ARTICLES.findIndex(a => a.id === articleId);
  if (index !== -1) {
      ARTICLES[index].reactions[reaction]++;
      saveData(STORAGE_KEYS.ARTICLES, ARTICLES);
      return ARTICLES[index].reactions;
  }
  return null;
};

export const createArticle = async (article: Article): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Initialize reactions
  article.reactions = { like: 0, love: 0, insightful: 0, sad: 0 };
  ARTICLES.unshift(article);
  saveData(STORAGE_KEYS.ARTICLES, ARTICLES);

  const notif = {
      id: Date.now().toString(),
      userId: '2', // Jane EIC
      message: `New submission from ${article.authorName}: ${article.title}`,
      type: 'info' as const,
      isRead: false,
      createdAt: new Date().toISOString()
  };
  NOTIFICATIONS.push(notif);
  saveData(STORAGE_KEYS.NOTIFS, NOTIFICATIONS);
};

export const updateArticle = async (article: Article): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = ARTICLES.findIndex(a => a.id === article.id);
    if (index !== -1) {
        ARTICLES[index] = article;
        saveData(STORAGE_KEYS.ARTICLES, ARTICLES);
    }
}

export const deleteArticle = async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    ARTICLES = ARTICLES.filter(a => a.id !== id);
    saveData(STORAGE_KEYS.ARTICLES, ARTICLES);
}

export const updateArticleStatus = async (articleId: string, status: Article['status'], feedback?: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = ARTICLES.findIndex(a => a.id === articleId);
    if (index !== -1) {
        ARTICLES[index].status = status;
        if (feedback) {
            ARTICLES[index].feedback = feedback;
        }
        
        saveData(STORAGE_KEYS.ARTICLES, ARTICLES);
        
        const msg = status === 'published' 
            ? `Your article "${ARTICLES[index].title}" has been published!` 
            : `Your article "${ARTICLES[index].title}" was ${status}. Feedback: ${feedback || 'None'}`;
        
        NOTIFICATIONS.push({
            id: Date.now().toString(),
            userId: ARTICLES[index].authorId,
            message: msg,
            type: status === 'published' ? 'success' : 'warning',
            isRead: false,
            createdAt: new Date().toISOString()
        });
        saveData(STORAGE_KEYS.NOTIFS, NOTIFICATIONS);
    }
};

// --- Report Functions ---

export const submitReport = async (report: Omit<ArticleReport, 'id' | 'timestamp' | 'status'>): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newReport: ArticleReport = {
        ...report,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        status: 'open'
    };
    REPORTS.unshift(newReport);
    saveData(STORAGE_KEYS.REPORTS, REPORTS);
};

export const getReports = async (): Promise<ArticleReport[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...REPORTS];
};

export const dismissReport = async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const idx = REPORTS.findIndex(r => r.id === id);
    if (idx !== -1) {
        REPORTS[idx].status = 'dismissed';
        saveData(STORAGE_KEYS.REPORTS, REPORTS);
    }
};

export const notifyAuthorOfReport = async (reportId: string, message: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const report = REPORTS.find(r => r.id === reportId);
    if (!report) return;

    // Find the article to get the author ID
    const article = ARTICLES.find(a => a.id === report.articleId);
    if (article) {
        NOTIFICATIONS.push({
            id: Date.now().toString(),
            userId: article.authorId,
            message: message,
            type: 'warning',
            isRead: false,
            createdAt: new Date().toISOString()
        });
        saveData(STORAGE_KEYS.NOTIFS, NOTIFICATIONS);
        
        // Mark report as resolved since action was taken
        const idx = REPORTS.findIndex(r => r.id === reportId);
        if (idx !== -1) {
            REPORTS[idx].status = 'resolved';
            saveData(STORAGE_KEYS.REPORTS, REPORTS);
        }
    }
};


// --- Universal Search ---

export const searchContent = async (query: string): Promise<SearchResult[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const q = query.toLowerCase();
    
    const results: SearchResult[] = [];
    
    // Search Articles
    ARTICLES.filter(a => a.status === 'published' && (a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q))).forEach(a => {
        results.push({
            type: 'article',
            title: a.title,
            url: `/article/${a.slug}`,
            description: a.excerpt
        });
    });

    // Search Pages
    PAGES.filter(p => p.isVisible && p.title.toLowerCase().includes(q)).forEach(p => {
        results.push({
            type: 'page',
            title: p.title,
            url: p.type === 'static' ? `/${p.slug}` : `/category/${p.slug}`,
            description: p.description || 'Page'
        });
    });

    return results;
};


// --- Contact & Feedback ---

export const sendContactMessage = async (msg: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    CONTACT_MESSAGES.unshift({
        ...msg,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        isRead: false
    });
    saveData(STORAGE_KEYS.MESSAGES, CONTACT_MESSAGES);
};

export const getContactMessages = async (): Promise<ContactMessage[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...CONTACT_MESSAGES];
};

export const markMessageRead = async (id: string): Promise<void> => {
    const idx = CONTACT_MESSAGES.findIndex(m => m.id === id);
    if(idx !== -1) {
        CONTACT_MESSAGES[idx].isRead = true;
        saveData(STORAGE_KEYS.MESSAGES, CONTACT_MESSAGES);
    }
};

export const subscribeToNewsletter = async (email: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!SUBSCRIBERS.includes(email)) {
        SUBSCRIBERS.push(email);
        saveData(STORAGE_KEYS.SUBSCRIBERS, SUBSCRIBERS);
    }
};

// --- Other Services ---

export const getComments = async (articleId?: string): Promise<Comment[]> => {
   await new Promise(resolve => setTimeout(resolve, 200));
   if (articleId) {
       return COMMENTS.filter(c => c.articleId === articleId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
   }
   return [...COMMENTS].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addComment = async (comment: Comment): Promise<void> => {
   await new Promise(resolve => setTimeout(resolve, 300));
   COMMENTS.push(comment);
   saveData(STORAGE_KEYS.COMMENTS, COMMENTS);
};

export const deleteComment = async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    COMMENTS = COMMENTS.filter(c => c.id !== id);
    saveData(STORAGE_KEYS.COMMENTS, COMMENTS);
}

export const getActivePoll = async (): Promise<Poll> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return ACTIVE_POLL;
};

export const votePoll = async (pollId: string, optionId: string): Promise<Poll> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  if (ACTIVE_POLL.id === pollId) {
    ACTIVE_POLL.options = ACTIVE_POLL.options.map(opt => 
      opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
    );
    ACTIVE_POLL.totalVotes += 1;
    saveData(STORAGE_KEYS.POLL, ACTIVE_POLL);
  }
  return ACTIVE_POLL;
};

export const getPrintEditions = async (): Promise<PrintEdition[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return PRINT_EDITIONS;
};

export const getBookmarkedArticles = async (slugs: string[]): Promise<Article[]> => {
  return ARTICLES.filter(a => slugs.includes(a.slug));
};

export const getKnowledgeBase = async (): Promise<string> => {
  const published = ARTICLES.filter(a => a.status === 'published');
  if (published.length === 0) return "No articles published yet.";
  return published.map(a => `
---
TITLE: ${a.title}
AUTHOR: ${a.authorName}
CATEGORY: ${a.categorySlug}
PUBLISHED: ${new Date(a.publishedAt).toLocaleDateString()}
CONTENT: ${a.content}
---`).join('\n');
};

export const getTeamMembers = async (): Promise<TeamMember[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return TEAM_MEMBERS;
};

export const getGalleryAlbums = async (): Promise<GalleryAlbum[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return ALBUMS;
};

export const getVideos = async (): Promise<Video[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return VIDEOS;
};

export const getSchoolEvents = async (): Promise<SchoolEvent[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    // Sort chronologically
    return SCHOOL_EVENTS.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const createEvent = async (event: SchoolEvent): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    SCHOOL_EVENTS.push(event);
    saveData(STORAGE_KEYS.EVENTS, SCHOOL_EVENTS);
};

export const updateEvent = async (event: SchoolEvent): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const idx = SCHOOL_EVENTS.findIndex(e => e.id === event.id);
    if(idx !== -1) {
        SCHOOL_EVENTS[idx] = event;
        saveData(STORAGE_KEYS.EVENTS, SCHOOL_EVENTS);
    }
};

export const deleteEvent = async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    SCHOOL_EVENTS = SCHOOL_EVENTS.filter(e => e.id !== id);
    saveData(STORAGE_KEYS.EVENTS, SCHOOL_EVENTS);
};

export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return NOTIFICATIONS.filter(n => n.userId === userId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const markNotificationRead = async (id: string): Promise<void> => {
    const index = NOTIFICATIONS.findIndex(n => n.id === id);
    if (index !== -1) {
        NOTIFICATIONS[index].isRead = true;
        saveData(STORAGE_KEYS.NOTIFS, NOTIFICATIONS);
    }
};
