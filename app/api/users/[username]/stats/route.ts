import { NextRequest } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";

const Username = z.string().min(3).max(20).regex(/^[a-z0-9_]+$/);

export async function GET(_req: NextRequest, context: { params: Promise<{ username: string }> }) {
  const { username } = await context.params;
  const parsed = Username.safeParse(username);
  if (!parsed.success) return Response.json({ error: "bad username" }, { status: 400 });

  try {
    // Get user profile first
    const { data: profile, error: profileError } = await supabaseAdmin
      .schema('social_art')
      .from("profiles")
      .select("user_id")
      .eq("username", parsed.data)
      .maybeSingle();

    if (profileError) {
      console.error("/api/users/[username]/stats profile error:", profileError.message);
      return Response.json({ error: profileError.message }, { status: 500 });
    }
    if (!profile) return Response.json({ error: "user not found" }, { status: 404 });

    const userId = profile.user_id;

    // Get posts count
    const { count: postsCount, error: postsError } = await supabaseAdmin
      .schema('social_art')
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId)
      .eq('is_deleted', false);

    if (postsError) {
      console.error("/api/users/[username]/stats posts error:", postsError.message);
      return Response.json({ error: postsError.message }, { status: 500 });
    }

    // Get total views for user's posts
    const { data: postsData, error: postsDataError } = await supabaseAdmin
      .schema('social_art')
      .from('posts')
      .select('id')
      .eq('author_id', userId)
      .eq('is_deleted', false);

    if (postsDataError) {
      console.error("/api/users/[username]/stats posts data error:", postsDataError.message);
      return Response.json({ error: postsDataError.message }, { status: 500 });
    }

    let totalViews = 0;
    if (postsData && postsData.length > 0) {
      const postIds = postsData.map(p => p.id);
      console.log(`Fetching views for ${postIds.length} posts for user ${userId}`);

      const { data: statsData, error: statsError } = await supabaseAdmin
        .schema('social_art')
        .from('posts_stats')
        .select('views_total')
        .in('post_id', postIds);

      if (statsError) {
        console.error("/api/users/[username]/stats views error:", statsError.message);
        console.error("Full stats error:", statsError);
        return Response.json({ error: statsError.message }, { status: 500 });
      }

      // console.log(`Found ${(statsData || []).length} stats records`);
      // console.log("Stats data:", statsData);
      totalViews = (statsData || []).reduce((sum, stat) => sum + (stat.views_total || 0), 0);
      // console.log(`Total views calculated: ${totalViews}`);
    } else {
      console.log(`No posts found for user ${userId}`);
    }

    return Response.json({
      stats: {
        posts: postsCount || 0,
        views: totalViews
      }
    });

  } catch (error) {
    console.error("/api/users/[username]/stats error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
