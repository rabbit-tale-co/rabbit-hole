"use server";

import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

const BUCKET = "social-art";

type PresignResp = { path: string; url: string; imageId: string };

export async function presignPostImageUpload(postId: string, ext: "jpg" | "jpeg" | "png" | "webp", authorId: string): Promise<{ error?: string; data?: PresignResp }> {
  if (!postId || !authorId) return { error: "Missing ids" };
  const sb = supabaseAdmin;
  const imageId = randomUUID();
  const path = `posts/${postId}/${imageId}.${ext}`;
  // 15 min
  const { data, error } = await sb.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) return { error: error.message };
  return { data: { path, url: data.signedUrl, imageId } };
}

export async function presignAvatarUpload(userId: string, ext: "jpg"|"jpeg"|"png"|"webp"): Promise<{ error?: string; data?: PresignResp }> {
  if (!userId) return { error: "Missing userId" };
  const sb = supabaseAdmin;
  const path = `avatars/${userId}/avatar.${ext === "jpeg" ? "jpg" : ext}`;
  const { data, error } = await sb.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) return { error: error.message };
  return { data: { path, url: data.signedUrl, imageId: "avatar" } };
}

export async function finalizeAvatar(userId: string, path: string) {
  const sb = supabaseAdmin;
  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
  const { error } = await sb.from("social_art.profiles").update({ avatar_url: publicUrl }).eq("user_id", userId);
  if (error) return { error: error.message };
  return { ok: true, avatar_url: publicUrl };
}
