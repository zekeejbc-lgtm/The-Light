
export enum UserRole {
  AUDITOR = 'AUDITOR',
  EIC = 'EIC',
  HEAD = 'HEAD',
  JOURNALIST = 'JOURNALIST',
  GUEST = 'GUEST',
}

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  schoolId?: string; // New field
  role: UserRole;
  avatar?: string;
  bio?: string;
  specialization?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface ArticleReactions {
  like: number;
  love: number;
  insightful: number;
  sad: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  authorId: string;
  authorName: string;
  categorySlug: string;
  imageUrl: string;
  videoUrl?: string; 
  publishedAt: string;
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'archived';
  views: number;
  feedback?: string;
  reactions: ArticleReactions;
  isMemberOnly?: boolean;
  isFeatured?: boolean; // New field for Big Card
}

export interface ArticleReport {
  id: string;
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  reporterId?: string; // Optional (anonymous reporting)
  reason: string;
  details?: string;
  timestamp: string;
  status: 'open' | 'resolved' | 'dismissed';
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface PageConfig {
  id: string;
  title: string;
  slug: string;
  type: 'category' | 'static';
  description?: string;
  isSystem?: boolean;
  isVisible: boolean;
  accessLevel: 'public' | 'member' | 'staff';
  orderScore: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface ThemeConfig {
  publicationName: string;
  publicationSubtext: string;
  logoUrl: string;
  primaryColor: string; // Replaces Brand Yellow
  accentColor: string;  // Replaces Brand Cyan
}

export interface SystemConfig {
  maintenanceMode: boolean;
  allowGuestSignup: boolean;
  theme: ThemeConfig;
  breakingNews?: {
    enabled: boolean;
    text: string;
    link?: string;
    bgColor?: string;
    textColor?: string;
    speed?: 'slow' | 'normal' | 'fast';
    linkedArticleId?: string;
  };
}

export interface Comment {
  id: string;
  articleId: string;
  articleTitle?: string; 
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
}

export interface PrintEdition {
  id: string;
  title: string;
  coverUrl: string;
  pdfUrl: string;
  publishDate: string;
  volume: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  email?: string;
  socialLinks?: {
      facebook?: string;
      twitter?: string;
  }
}

export interface GalleryAlbum {
  id: string;
  title: string;
  coverUrl: string;
  imageCount: number;
  images: string[];
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  category: string;
  publishedAt: string;
}

export interface SearchResult {
  type: 'article' | 'page' | 'user';
  title: string;
  url: string;
  description: string;
}

export interface SubEvent {
  id: string;
  time: string;
  title: string;
  location?: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  category: 'Sports' | 'Academic' | 'Arts' | 'Club' | 'General';
  status?: 'scheduled' | 'rescheduled' | 'cancelled'; // New Field
  imageUrl?: string;
  subEvents?: SubEvent[];
}

export interface AccessLog {
  id: string;
  userId?: string;
  userName?: string; 
  action: 'LOGIN' | 'VIEW_ARTICLE' | 'SYSTEM_CHANGE' | 'ACCESS_DENIED';
  details: string; 
  timestamp: string;
}
