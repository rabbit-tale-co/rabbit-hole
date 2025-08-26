// app/api/posts/route.ts
import { NextRequest } from "next/server";
import { CreatePost, Cursor } from "@/lib/validation";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = Cursor.safeParse({
    cursor: searchParams.get("cursor") ?? undefined,
    limit: Number(searchParams.get("limit") ?? "24"),
  });
  if (!parsed.success) return Response.json({ error: "bad cursor" }, { status: 400 });

  const { cursor, limit } = parsed.data;
  const where: string[] = ["is_deleted = false"];
  const params: string[] = [];
  let idx = 1;

  if (cursor) {
    const [ts, id] = Buffer.from(cursor, "base64").toString("utf8").split("|");
    where.push(`(created_at, id) < ($${idx}, $${idx + 1})`);
    params.push(ts, id);
    idx += 2;
  }

  const userIdParam = searchParams.get("userId");
  if (userIdParam) {
    const uid = z.uuid().safeParse(userIdParam);
    if (!uid.success) return Response.json({ error: "bad userId" }, { status: 400 });
    where.push(`author_id = $${idx}`);
    params.push(uid.data);
    idx += 1;
  }

  // Use query builder instead of RPC here to avoid dynamic SQL and param mismatch
  let query = supabaseAdmin
    .from("posts")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  if (userIdParam) {
    query = query.eq("author_id", userIdParam);
  }

  if (cursor) {
    const [ts, id] = Buffer.from(cursor, "base64").toString("utf8").split("|");
    query = query.lt("created_at", ts).or(`and(created_at.eq.${ts},id.lt.${id})`);
  }

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const nextCursor = data && data.length
    ? Buffer.from(`${data[data.length - 1].created_at}|${data[data.length - 1].id}`).toString("base64")
    : null;

  return Response.json({ items: data ?? [], nextCursor });
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
