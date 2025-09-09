// Safe user types that exclude sensitive information

export interface User {
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  accent_color: string | null;
  is_premium: boolean;
  followStats?: {
    isFollowing: boolean;
    followers: number;
    following: number;
  };
}

export interface UserListItem {
  user_id: string;
  username: string;
  display_name?: string;
  bio?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  accent_color?: string | null;
  is_premium: boolean;
  followStats?: {
    isFollowing: boolean;
    followers: number;
    following: number;
  };
}

// Internal user types with sensitive data (for server-side use only)
export interface InternalUser {
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  accent_color: string | null;
  is_premium: boolean;
  is_admin?: boolean;
  banned_until?: string | null;
  followStats?: {
    isFollowing: boolean;
    followers: number;
    following: number;
  };
}

export interface InternalUserListItem {
  user_id: string;
  username: string;
  display_name?: string;
  bio?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  accent_color?: string | null;
  is_premium?: boolean;
  is_admin?: boolean;
  banned_until?: string | null;
  followStats?: {
    isFollowing: boolean;
    followers: number;
    following: number;
  };
}
