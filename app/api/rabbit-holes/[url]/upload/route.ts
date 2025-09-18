import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifySupabaseJWT } from "@/lib/jwt-utils";
import { randomUUIDv7 } from "@/lib/uuid";

let ffmpegPath: string | null = null;
try {
  const mod = await import("ffmpeg-static");
  // @ts-ignore
  ffmpegPath = mod.default || (mod as unknown as string);
} catch {
  ffmpegPath = null;
}
import { execFile } from "child_process";
import { promisify } from "util";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function convertImage(buffer: Buffer, mime: string) {
  const isGif = mime === "image/gif";
  if (isGif) {
    return { buffer, ext: "gif", outMime: "image/gif" } as const;
  }
  try {
    const sharpMod = await import("sharp");
    const sharp = (sharpMod as any).default || sharpMod;
    const img = sharp(buffer);
    const webp = await img.webp({ quality: 90 }).toBuffer();
    return { buffer: webp, ext: "webp", outMime: "image/webp" } as const;
  } catch {
    const fallbackExt = mime.endsWith("png") ? "png" : mime.includes("jpeg") ? "jpg" : "bin";
    return { buffer, ext: fallbackExt, outMime: mime || "application/octet-stream" } as const;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ url: string }> }
) {
  try {
    const { url } = await params;
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const user = await verifySupabaseJWT(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const form = await req.formData();
    const type = String(form.get("type") || "avatar"); // avatar | cover
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    // Load rabbit hole and verify owner
    const { data: rh } = await supabaseAdmin
      .from("rabbit_holes")
      .select("id, owner_id")
      .eq("url", url)
      .single();
    if (!rh) return NextResponse.json({ error: "Rabbit hole not found" }, { status: 404 });
    if (rh.owner_id !== user.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // Convert
    const arrayBuffer = await file.arrayBuffer();
    const input = Buffer.from(arrayBuffer);
    const im = await convertImage(input, file.type || "image/jpeg");

    // Upload to storage
    const bucket = "social-art";
    const imageId = randomUUIDv7();
    const key = `posts/rabbit-holes/${rh.id}/${type}/${imageId}.${im.ext}`;
    const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object`;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";
    if (!baseUrl || !serviceKey) {
      return NextResponse.json({ error: "Missing Supabase env" }, { status: 500 });
    }
    const fd = new FormData();
    const view = new Uint8Array(im.buffer.buffer, im.buffer.byteOffset, im.buffer.byteLength);
    const ab = new ArrayBuffer(view.byteLength);
    new Uint8Array(ab).set(view);
    const blob = new Blob([ab], { type: im.outMime });
    fd.append("file", blob, path.basename(key));
    const uploadRes = await fetch(`${baseUrl}/${bucket}/${key}`, {
      method: "POST",
      headers: { authorization: `Bearer ${serviceKey}`, "x-upsert": "true" },
      body: fd,
    });
    if (!uploadRes.ok) {
      const txt = await uploadRes.text().catch(() => "");
      return NextResponse.json({ error: "storage_upload_failed", details: txt }, { status: 500 });
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${key}`;

    const patch: Record<string, string | null> = {};
    if (type === "cover") patch.cover_url = publicUrl; else patch.avatar_url = publicUrl;
    const { error: updErr } = await supabaseAdmin
      .from("rabbit_holes")
      .update(patch)
      .eq("id", rh.id);
    if (updErr) return NextResponse.json({ error: "db_update_failed" }, { status: 500 });

    return NextResponse.json({ url: publicUrl, type });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


