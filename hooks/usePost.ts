"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Types
export interface Post {
  id: string;
  author_id: string;
  text: string | null;
  images: {
    id: string;
    path: string;
    alt?: string;
    width?: number;
    height?: number;
    mime?: string;
  }[];
  created_at: string;
  like_count?: number;
  comment_count?: number;
  repost_count?: number;
  bookmark_count?: number;
  is_liked?: boolean;
  is_reposted?: boolean;
  is_bookmarked?: boolean;
  stats?: {
    likes: number;
    comments: number;
    reposts: number;
    bookmarks: number;
  };
}

export interface Author {
  username: string;
  display_name?: string | null;
  avatar_url?: string | null;
  is_premium?: boolean;
}

export interface PostWithAuthor extends Post {
  author: Author;
}

// Main usePost hook for post-related functionality
export function usePost(postId?: string) {
  const { user } = useAuth();

  // Post state
  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Post actions state
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Fetch single post
  const fetchPost = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const r = await fetch(`/api/posts/${encodeURIComponent(id)}`, { cache: "no-store" });
      const j = await r.json();

      if (!r.ok) {
        setError(j?.error || `status_${r.status}`);
        return;
      }

      setPost(j.post as Post);
      setAuthor(j.author as Author);
      } catch {
        setError("network_error");
      } finally {
      setLoading(false);
    }
  }, []);

  // Delete post
  const deletePost = useCallback(async (postId: string) => {
    if (!post) return;

    setDeleting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        toast.error("Not authenticated");
        return;
      }

      const r = await fetch(`/api/posts/${postId}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ _action: "delete" })
      });

      if (!r.ok) throw new Error("delete_failed");

      toast.success("Post deleted");
      return { success: true };
    } catch (error) {
      console.error("Delete post error:", error);
      toast.error("Failed to delete post");
      throw error;
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }, [post]);

  // Copy link
  const copyLink = useCallback(async (postId: string) => {
    try {
      const url = `${window.location.origin}/post/${postId}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Failed to copy link");
    }
  }, []);

  // Check if current user owns the post
  const isOwnPost = useMemo(() => {
    return post && user?.id === post.author_id;
  }, [post, user?.id]);

  // Check if current user is admin
  const isAdmin = useMemo(() => {
    return Boolean((user as unknown as { is_admin?: boolean } | null)?.is_admin);
  }, [user]);

  // Auto-fetch post when postId changes
  useEffect(() => {
    if (postId) {
      fetchPost(postId);
    }
  }, [postId, fetchPost]);

  return {
    // State
    post,
    author,
    loading,
    error,
    deleting,
    confirmOpen,

    // Actions
    fetchPost,
    deletePost,
    copyLink,
    setConfirmOpen,

    // Computed
    isOwnPost,
    isAdmin,
  };
}

// Hook for post creation
export function usePostCreation() {
  const { user } = useAuth();

  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = useCallback(async (postData: {
    text?: string;
    images: Array<{
      id: string;
      path: string;
      alt: string;
      width: number;
      height: number;
      size_bytes: number;
      mime: string;
      is_cover: boolean;
    }>;
  }) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    setPosting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(postData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create post');
      }

      const realPost = await res.json();
      return realPost;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong.';
      setError(errorMessage);
      throw error;
    } finally {
      setPosting(false);
    }
  }, [user]);

  return {
    posting,
    error,
    createPost,
  };
}

// Hook for post interactions (likes, comments, etc.)
export function usePostInteractions(postId: string) {
  const { getToken } = useAuth();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleLike = useCallback(async () => {
    if (loading) return;

    setLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();
      setLiked(data.liked);
      setLikesCount(data.count);
    } catch (error) {
      console.error('Like error:', error);
      toast.error('Failed to update like');
    } finally {
      setLoading(false);
    }
  }, [postId, getToken, loading]);

  const updateState = useCallback((isLiked: boolean, count: number) => {
    setLiked(isLiked);
    setLikesCount(count);
  }, []);

  return {
    liked,
    likesCount,
    loading,
    handleLike,
    updateState,
  };
}
