// Tweet with author info
export interface TweetWithAuthor {
  id: string;
  content: string;
  author_id: string;
  images: string[] | null;
  likes_count: number;
  bookmarks_count: number;
  retweets_count: number;
  comments_count: number;
  quotes_count?: number;
  views_count?: number;
  parent_id?: string | null;
  quote_id?: string | null;
  is_deleted: boolean;
  is_pinned?: boolean;
  created_at: string;
  updated_at: string | null;
  author: {
    id: string;
    username: string;
    display_name: string;
    avatar: string | null;
  };
  is_liked?: boolean;
  is_bookmarked?: boolean;
  is_retweeted?: boolean;
}

// User profile
export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  cover_image: string | null;
  created_at: string;
  updated_at: string | null;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Current user (mock)
export const CURRENT_USER: UserProfile = {
  id: 'current-user',
  username: 'you',
  display_name: 'Your Name',
  email: 'you@example.com',
  avatar: null,
  bio: 'Building the future, one tweet at a time.',
  cover_image: null,
  created_at: new Date().toISOString(),
  updated_at: null,
};
