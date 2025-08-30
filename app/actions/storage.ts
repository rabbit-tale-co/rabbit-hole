"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { randomUUID } from "crypto";

const BUCKET = "social-art";
const FOLDER_AVATARS = "avatar"; // avatar/<userUUID>/avatar.ext
const FOLDER_POSTS = "posts";   // posts/<postUUID>/<imageUUID>.ext

type PresignResp = { path: string; url: string; token: string; imageId: string };

export async function presignPostImageUpload(postId: string, ext: "jpg" | "jpeg" | "png" | "webp", authorId: string): Promise<{ error?: string; data?: PresignResp }> {
  if (!postId || !authorId) return { error: "Missing ids" };
  const sb = supabaseAdmin;
  const imageId = randomUUID();
  const targetExt = ext; // keep original extension to avoid client-side conversion issues
  const path = `${FOLDER_POSTS}/${postId}/${imageId}.${targetExt}`;
  // 15 min
  const { data, error } = await sb.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) return { error: error.message };
  return { data: { path, url: data.signedUrl, token: data.token, imageId } };
}

export async function presignAvatarUpload(userId: string, ext: "jpg"|"jpeg"|"png"|"webp"|"gif"): Promise<{ error?: string; data?: PresignResp }> {
  if (!userId) return { error: "Missing userId" };
  const sb = supabaseAdmin;
  const targetExt = ext; // keep original extension (gif allowed)
  // Clean up any existing avatar files for this user to prevent clutter and conflicts
  try {
    const { data: listed } = await sb.storage.from(BUCKET).list(`${FOLDER_AVATARS}/${userId}`);
    const toRemove = (listed || []).map((it) => `${FOLDER_AVATARS}/${userId}/${it.name}`);
    if (toRemove.length > 0) { await sb.storage.from(BUCKET).remove(toRemove); }
  } catch { }
  // Use unique name to avoid "resource already exists"
  const uid = randomUUID();
  const path = `${FOLDER_AVATARS}/${userId}/avatar-${uid}.${targetExt}`;
  const { data, error } = await sb.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) return { error: error.message };
  return { data: { path, url: data.signedUrl, token: data.token, imageId: "avatar" } };
}

export async function finalizeAvatar(userId: string, path: string) {
  const sb = supabaseAdmin;
  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
  const { error } = await sb.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", userId);
  if (error) return { error: error.message };
  return { ok: true, avatar_url: publicUrl };
}

export async function presignCoverUpload(userId: string, ext: "jpg"|"jpeg"|"png"|"webp"|"gif"): Promise<{ error?: string; data?: PresignResp }> {
  if (!userId) return { error: "Missing userId" };
  const sb = supabaseAdmin;
  const targetExt = ext; // keep original extension
  try {
    const { data: listed } = await sb.storage.from(BUCKET).list(`covers/${userId}`);
    const toRemove = (listed || []).map((it) => `covers/${userId}/${it.name}`);
    if (toRemove.length > 0) { await sb.storage.from(BUCKET).remove(toRemove); }
  } catch { }
  const uid = randomUUID();
  const path = `covers/${userId}/cover-${uid}.${targetExt}`;
  const { data, error } = await sb.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) return { error: error.message };
  return { data: { path, url: data.signedUrl, token: data.token, imageId: "cover" } };
}

export async function finalizeCover(userId: string, path: string) {
  const sb = supabaseAdmin;
  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
  const { error } = await sb.from("profiles").update({ cover_url: publicUrl }).eq("user_id", userId);
  if (error) return { error: error.message };
  return { ok: true, cover_url: publicUrl };
}

// Optional helper to remove entire post folder when a post is deleted
export async function deletePostFolder(postId: string) {
  const sb = supabaseAdmin;
  const { error } = await sb.storage.from(BUCKET).remove([`${FOLDER_POSTS}/${postId}`]);
  if (error) return { error: error.message };
  return { ok: true };
}

// Remove user's avatar file(s) and clear profile.avatar_url
export async function removeAvatar(userId: string) {
  if (!userId) return { error: "Missing userId" };
  const sb = supabaseAdmin;
  // Remove all files in avatar folder for this user
  try {
    const { data: listed } = await sb.storage.from(BUCKET).list(`${FOLDER_AVATARS}/${userId}`);
    const toRemove = (listed || []).map((it) => `${FOLDER_AVATARS}/${userId}/${it.name}`);
    if (toRemove.length > 0) { await sb.storage.from(BUCKET).remove(toRemove); }
  } catch { }
  const { error } = await sb.from("profiles").update({ avatar_url: null }).eq("user_id", userId);
  if (error) return { error: error.message };
  return { ok: true };
}

// Remove user's cover file(s) and clear profile.cover_url
export async function removeCover(userId: string) {
  if (!userId) return { error: "Missing userId" };
  const sb = supabaseAdmin;
  try {
    const { data: listed } = await sb.storage.from(BUCKET).list(`covers/${userId}`);
    const toRemove = (listed || []).map((it) => `covers/${userId}/${it.name}`);
    if (toRemove.length > 0) { await sb.storage.from(BUCKET).remove(toRemove); }
  } catch { }
  const { error } = await sb.from("profiles").update({ cover_url: null }).eq("user_id", userId);
  if (error) return { error: error.message };
  return { ok: true };
}
