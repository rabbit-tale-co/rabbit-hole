// app/actions/follow.ts
'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';

type FollowStats = {
  isFollowing: boolean;
  followers: number; // how many follow target
  following: number; // how many accounts target follows
};

export async function getFollowStats(targetUserId: string, currentUserId?: string): Promise<FollowStats> {
  const meId = currentUserId ?? null;

  // isFollowing?
  let isFollowing = false;
  if (meId && meId !== targetUserId) {
    const { data: rel, error } = await supabaseAdmin
      .from('follows')
      .select('follower_id')
      .eq('follower_id', meId)
      .eq('following_id', targetUserId)
      .limit(1);
    if (!error) isFollowing = Boolean(rel?.length);
  }

  // followers count (who follows target)
  const followersQ = supabaseAdmin
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', targetUserId);
  const { count: followers = 0 } = await followersQ;

  // following count (who target follows)
  const followingQ = supabaseAdmin
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', targetUserId);
  const { count: following = 0 } = await followingQ;

  return { isFollowing, followers: followers ?? 0, following: following ?? 0 };
}

export async function toggleFollow(targetUserId: string, currentUserId: string): Promise<FollowStats & { ok: boolean; error?: string }> {
  const meId = currentUserId;

  if (!meId) {
    return { ok: false, error: 'UNAUTHORIZED', isFollowing: false, followers: 0, following: 0 };
  }
  if (meId === targetUserId) {
    return { ok: false, error: 'CANNOT_FOLLOW_SELF', isFollowing: false, followers: 0, following: 0 };
  }

  // Check current relationship
  const { data: rel, error: selErr } = await supabaseAdmin
    .from('follows')
    .select('follower_id')
    .eq('follower_id', meId)
    .eq('following_id', targetUserId)
    .limit(1);

  if (selErr) {
    // fallback: still return current stats for UI stability
    const snap = await getFollowStats(targetUserId, meId);
    return { ok: false, error: selErr.message, ...snap };
  }

  if (rel?.length) {
    // Unfollow
    const { error: delErr } = await supabaseAdmin
      .from('follows')
      .delete()
      .eq('follower_id', meId)
      .eq('following_id', targetUserId);
    if (delErr) {
      const snap = await getFollowStats(targetUserId, meId);
      return { ok: false, error: delErr.message, ...snap };
    }
  } else {
    // Follow
    const { error: insErr } = await supabaseAdmin
      .from('follows')
      .insert({ follower_id: meId, following_id: targetUserId });
    if (insErr) {
      const snap = await getFollowStats(targetUserId, meId);
      return { ok: false, error: insErr.message, ...snap };
    }
  }

  const snap = await getFollowStats(targetUserId, meId);
  return { ok: true, ...snap };
}

// Get followers list with pagination
export async function getFollowersPage(targetUserId: string, cursor?: string, limit = 24) {
  const supabase = supabaseAdmin;

  let query = supabase
    .from('follows')
    .select(`
      follower_id,
      created_at
    `)
    .eq('following_id', targetUserId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    try {
      const [timestamp] = Buffer.from(cursor, "base64").toString("utf8").split("|");
      query = query.lt('created_at', timestamp);
    } catch {
      // Invalid cursor, ignore
    }
  }

  const { data, error } = await query;
  if (error) {
    console.log('[getFollowersPage] Query error:', error);
    return { error: error.message };
  }

  console.log('[getFollowersPage] Raw data:', data);

  type FollowRow = {
    follower_id: string;
    created_at: string;
  };

  // Get user profiles for the follower IDs
  const followerIds = (data as FollowRow[] || []).map(row => row.follower_id);

  if (followerIds.length === 0) {
    return { items: [], nextCursor: null };
  }

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id, username, display_name, bio, avatar_url, cover_url, accent_color, is_premium')
    .in('user_id', followerIds);

  if (profilesError) {
    return { error: profilesError.message };
  }

  const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

  const items = (data as FollowRow[] || [])
    .map(row => {
      const profile = profileMap.get(row.follower_id);
      if (!profile) return null;

      return {
        user_id: row.follower_id,
        username: profile.username,
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        cover_url: profile.cover_url,
        accent_color: profile.accent_color,
        is_premium: profile.is_premium,
        followed_at: row.created_at
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const nextCursor = items.length === limit && data?.length === limit
    ? Buffer.from(`${(data[data.length - 1] as FollowRow).created_at}|${items[items.length - 1].user_id}`).toString("base64")
    : null;

  return { items, nextCursor };
}

// Get following list with pagination
export async function getFollowingPage(targetUserId: string, cursor?: string, limit = 24) {
  const supabase = supabaseAdmin;

  let query = supabase
    .from('follows')
    .select(`
      following_id,
      created_at
    `)
    .eq('follower_id', targetUserId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    try {
      const [timestamp] = Buffer.from(cursor, "base64").toString("utf8").split("|");
      query = query.lt('created_at', timestamp);
    } catch {
      // Invalid cursor, ignore
    }
  }

  const { data, error } = await query;
  if (error) return { error: error.message };

  type FollowingRow = {
    following_id: string;
    created_at: string;
  };

  // Get user profiles for the following IDs
  const followingIds = (data as FollowingRow[] || []).map(row => row.following_id);

  if (followingIds.length === 0) {
    return { items: [], nextCursor: null };
  }

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id, username, display_name, bio, avatar_url, cover_url, accent_color, is_premium')
    .in('user_id', followingIds);

  if (profilesError) {
    return { error: profilesError.message };
  }

  const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

  const items = (data as FollowingRow[] || [])
    .map(row => {
      const profile = profileMap.get(row.following_id);
      if (!profile) return null;

      return {
        user_id: row.following_id,
        username: profile.username,
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        cover_url: profile.cover_url,
        accent_color: profile.accent_color,
        is_premium: profile.is_premium,
        followed_at: row.created_at
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const nextCursor = items.length === limit && data?.length === limit
    ? Buffer.from(`${(data[data.length - 1] as FollowingRow).created_at}|${items[items.length - 1].user_id}`).toString("base64")
    : null;

  return { items, nextCursor };
}
