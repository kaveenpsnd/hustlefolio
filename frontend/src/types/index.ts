// ============================================
// DOMAIN MODELS - Core TypeScript Interfaces
// ============================================

// Auth & User Types
export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  bio?: string;
  profilePictureUrl?: string;
  websiteUrl?: string;
  githubUsername?: string;
  twitterUsername?: string;
  linkedinUrl?: string;
  createdAt: string;
}

export interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  bio?: string;
  profilePictureUrl?: string;
  websiteUrl?: string;
  githubUsername?: string;
  twitterUsername?: string;
  linkedinUrl?: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  bio?: string;
  websiteUrl?: string;
  githubUsername?: string;
  twitterUsername?: string;
  linkedinUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  user?: User; // Constructed on frontend
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

// Goal Types
export interface Goal {
  id: number;
  userId?: number;
  title: string;
  description?: string;
  targetDays: number;
  startDate: string;
  endDate?: string;
  active: boolean; // Backend sends 'active', not 'isActive'
  createdAt?: string;
  // Gamification fields from backend
  currentStreak?: number;
  totalPoints?: number;
  streakStatus?: string;
  longestStreak?: number;
  freezeCount?: number;
  lastUpdatedDate?: string;
  checkinDates?: string[];
}

export interface GoalCreateRequest {
  username: string;
  title: string;
  description?: string;
  targetDays: number;
  currentStreak?: number;
}

// Gamification Types
export type Rank = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'LEGENDARY';

export interface XPProgress {
  currentXP: number;
  xpToNextRank: number;
  currentRank: Rank;
  nextRank?: Rank;
}

// Post Types (Editor.js JSON Blocks)
export interface EditorJSBlock {
  id?: string;
  type: string;
  data: {
    text?: string;
    level?: number;
    items?: string[];
    file?: {
      url: string;
    };
    caption?: string;
    withBorder?: boolean;
    stretched?: boolean;
    withBackground?: boolean;
    [key: string]: any;
  };
}

export interface EditorJSContent {
  time?: number;
  version?: string;
  blocks: EditorJSBlock[];
}

export interface Post {
  id: number;
  title: string;
  content: string | EditorJSContent; // Can be JSON string from backend or parsed object
  authorUsername: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  imageUrl?: string;
  featuredImage?: string;
  // Optional populated fields
  userId?: number;
  goalId?: number;
  slug?: string;
  isPublished?: boolean;
  author?: User;
  goal?: Goal;
}

export interface PostCreateRequest {
  goalId: number;
  title: string;
  content: EditorJSContent;
  isPublished: boolean;
  featuredImage?: string;
}

export interface PostUpdateRequest {
  title?: string;
  content?: EditorJSContent;
  isPublished?: boolean;
  featuredImage?: string;
}

// Dashboard DTO
export interface DashboardDTO {
  hasActiveGoal: boolean;
  goalCount: number;
  completedGoalCount?: number;
  activeGoals: Goal[];
  completedGoals?: Goal[];
  message?: string;
  user?: User;
  activeGoal?: Goal;
  stats?: {
    totalPosts: number;
    currentStreak: number;
    longestStreak: number;
    totalXP: number;
    rank: Rank;
  };
  xpProgress?: XPProgress;
  recentPosts?: Post[];
  activityMap?: ActivityDay[]; // For calendar heatmap (365 days)
  // Additional fields from backend
  weeklyPulse?: number;
  xpToNextRank?: number;
  percentComplete?: number;
  // New XP and Rank fields
  totalXP?: number;
  rank?: string;
  currentStreak?: number;
  longestStreak?: number;
}

export interface ActivityDay {
  date: string; // ISO format YYYY-MM-DD
  count: number; // Number of posts on that day
}

// Image Upload
export interface ImageUploadResponse {
  url: string; // Backend returns { url: "..." }
  // Legacy Editor.js format (keeping for compatibility)
  success?: 1 | 0;
  file?: {
    url: string;
  };
}

// Error Handling
export interface APIError {
  message: string;
  code?: string;
  status?: number;
}

export class GoalRequiredException extends Error {
  constructor(message: string = 'You must set an active goal before creating a post') {
    super(message);
    this.name = 'GoalRequiredException';
  }
}
