// app/api/posts/route.ts
import { NextRequest } from "next/server";
import { CreatePost, Cursor } from "@/lib/validation";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUser } from "@/lib/auth";
import { PostRow } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = Cursor.safeParse({
    cursor: searchParams.get("cursor") ?? undefined,
    limit: Number(searchParams.get("limit") ?? "24"),
  });
  if (!parsed.success) return Response.json({ error: "bad cursor" }, { status: 400 });

  const user = await getUser(req);
  const { cursor, limit } = parsed.data;

  const userIdParam = searchParams.get("userId");
  if (userIdParam) {
    const uid = z.uuid().safeParse(userIdParam);
    if (!uid.success) return Response.json({ error: "bad userId" }, { status: 400 });
  }

  // suspended authors to exclude
  let suspendedIds: string[] = [];
  try {
    const nowIso = new Date().toISOString();
    const { data: susp } = await supabaseAdmin
      .schema("social_art")
      .from("suspended_users")
      .select("user_id")
      .gt("banned_until", nowIso);
    suspendedIds = (susp || []).map((r: { user_id: string }) => r.user_id).filter(Boolean);
  } catch {}

  // helper to fetch one chunk using key-set cursor
  const fetchChunk = async (
    c: string | null | undefined,
    chunk: number
  ): Promise<{ rows: PostRow[]; next: string | null }> => {
    let q = supabaseAdmin
      .from("posts")
      .select("*")
      // include NULL (legacy) and false without using another OR:
      .neq("is_deleted", true)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(chunk + 1);

    if (userIdParam) q = q.eq("author_id", userIdParam);
    if (suspendedIds.length > 0) {
      const list = `(${suspendedIds.join(",")})`;
      q = q.not("author_id", "in", list);
    }

    if (c) {
      const [ts, id] = Buffer.from(c, "base64").toString("utf8").split("|");
      // one OR for the key-set condition
      q = q.or(`and(created_at.lt.${ts}),and(created_at.eq.${ts},id.lt.${id})`);
    }

    const { data, error } = await q;
    if (error) throw new Error(error.message);

    const hasMore = (data?.length ?? 0) > chunk;
    const rows = (data ?? []).slice(0, chunk);
    let next: string | null = null;
    if (hasMore && rows.length > 0) {
      const last = rows[rows.length - 1];
      next = Buffer.from(`${last.created_at}|${last.id}`).toString("base64");
    }
    return { rows, next };
  };

  // back-fill to gather up to `limit` visible posts
  let acc: PostRow[] = [];
  let nextCursor = cursor ?? null;
  // safety guard to avoid pathological loops
  for (let i = 0; acc.length < limit && i < 6; i++) {
    const need = limit - acc.length;
    const { rows, next } = await fetchChunk(nextCursor, need);
    acc = acc.concat(rows);
    nextCursor = next;
    if (!nextCursor) break; // truly no more
  }

  // attach current-user like flags for returned page only
  if (user && acc.length > 0) {
    try {
      const postIds = acc.map(p => p.id);
      const { data: likes } = await supabaseAdmin
        .from("likes")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", postIds);
      const liked = new Set((likes || []).map(l => l.post_id));
      acc = acc.map(p => ({ ...p, is_liked: liked.has(p.id) }));
    } catch {}
  }

  return Response.json({
    items: acc,
    nextCursor: nextCursor ?? null,
  });
}

export async function POST(req: NextRequest) {
  // verify Supabase session JWT from Authorization/Cookie
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  const cookie = req.headers.get("cookie") || req.headers.get("Cookie");
  let accessToken: string | null = null;
  if (auth && auth.startsWith("Bearer ")) accessToken = auth.slice(7);
  if (!accessToken && cookie) {
    const match = /(?:^|; )sb-access-token=([^;]+)/.exec(cookie);
    if (match) accessToken = decodeURIComponent(match[1]);
  }
  let user: { id: string } | null = null;
  if (accessToken) {
    const { data } = await supabaseAdmin.auth.getUser(accessToken);
    if (data?.user) user = { id: data.user.id };
  }
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const parsed = CreatePost.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const { images, text } = parsed.data;

  // Insert post
  const { data, error } = await supabaseAdmin
    .from("posts")
    .insert({
      author_id: user.id,
      text: text ?? null,
      images,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ post: data }, { status: 201 });
}
