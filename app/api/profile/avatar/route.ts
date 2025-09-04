import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "path";
import os from "os";
import { promises as fs } from "fs";
import { execFile } from "child_process";
import { promisify } from "util";

let ffmpegPath: string | null = null;
try {
  const mod = await import("ffmpeg-static");
  ffmpegPath = (mod as unknown as { default?: string }).default || (mod as unknown as string);
} catch {
  ffmpegPath = null;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "auto";
export const maxDuration = 60;

const execFileAsync = promisify(execFile);

type ConvertResult = { buffer: Buffer; ext: "gif" | "webm"; mime: string };

async function resolveFfmpegCommand(): Promise<string | null> {
  // Priority: explicit env, static path, then PATH fallback
  const fromEnv = (process.env.FFMPEG_PATH || "").trim();
  if (fromEnv) {
    try { await fs.access(fromEnv); return fromEnv; } catch { /* ignore */ }
  }
  if (ffmpegPath && typeof ffmpegPath === "string") {
    try { await fs.access(ffmpegPath); return ffmpegPath; } catch { /* ignore */ }
  }
  return "ffmpeg"; // rely on system PATH
}

async function convertGifToWebM(buffer: Buffer, crop?: { x: number; y: number; w: number; h: number }): Promise<ConvertResult> {
  const cmd = await resolveFfmpegCommand();
  console.log("[avatar] convert start: ffmpeg=%s crop=%o", cmd, crop);
  if (!cmd) {
    return { buffer, ext: "gif", mime: "image/gif" };
  }
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "avatar-"));
  const inPath = path.join(tmpDir, "in.gif");
  const outPath = path.join(tmpDir, "out.webm");
  await fs.writeFile(inPath, buffer);
  try {
    const args = [
      "-y",
      "-i", inPath,
    ];
    if (crop && crop.w > 0 && crop.h > 0) {
      args.push("-vf", `crop=${Math.floor(crop.w)}:${Math.floor(crop.h)}:${Math.floor(crop.x)}:${Math.floor(crop.y)}`);
    }
    args.push(
      "-c:v", "libvpx-vp9",
      "-b:v", "0",
      "-crf", "32",
      "-pix_fmt", "yuv420p",
      "-an",
      outPath,
    );
    console.log("[avatar] ffmpeg cmd:", cmd, "args:", args.join(" "));
    await execFileAsync(cmd, args, { maxBuffer: 1024 * 1024 * 32 });
    const out = await fs.readFile(outPath);
    console.log("[avatar] ffmpeg ok: bytes=%d", out.length);
    return { buffer: out, ext: "webm", mime: "video/webm" };
  } catch (e) {
    console.error("[avatar] ffmpeg fail:", e);
    return { buffer, ext: "gif", mime: "image/gif" };
  } finally {
    fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const userId = String(form.get("userId") || "");
    const file = form.get("file");
    const cropX = Number(form.get("crop_x") || 0);
    const cropY = Number(form.get("crop_y") || 0);
    const cropW = Number(form.get("crop_w") || 0);
    const cropH = Number(form.get("crop_h") || 0);
    console.log("[avatar] request: userId=%s name=%s type=%s size=%d crop=%d,%d %dx%d", userId, (file as File).name, (file as File).type, (file as File).size, cropX, cropY, cropW, cropH);
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const input = Buffer.from(arrayBuffer);
    const isGif = (file.type || "").toLowerCase() === "image/gif" || (file.name || "").toLowerCase().endsWith(".gif");

    let out: ConvertResult | { buffer: Buffer; ext: string; mime: string } = { buffer: input, ext: "bin", mime: file.type || "application/octet-stream" };
    if (isGif) {
      const crop = cropW > 0 && cropH > 0 ? { x: cropX, y: cropY, w: cropW, h: cropH } : undefined;
      out = await convertGifToWebM(input, crop);
    } else {
      // non-GIF: keep original; client already converts to webp if needed
      out = { buffer: input, ext: (file.name.split(".").pop() || "bin").toLowerCase(), mime: file.type || "application/octet-stream" };
    }

    const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object`;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";
    if (!baseUrl || !serviceKey) return NextResponse.json({ error: "Missing Supabase env" }, { status: 500 });

    const bucket = "social-art";
    const uid = randomUUID();
    const key = `avatar/${userId}/avatar-${uid}.${out.ext}`;

    // Clean existing avatar files
    try {
      const listUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/list/${bucket}`;
      await fetch(listUrl, {
        method: "POST",
        headers: { authorization: `Bearer ${serviceKey}`, "content-type": "application/json" },
        body: JSON.stringify({ prefix: `avatar/${userId}` }),
      }).then(async (r) => {
        const j = (await r.json().catch(() => null)) as unknown;
        if (Array.isArray(j)) {
          const removes = (j as Array<{ name: string }>).map((it) => `avatar/${userId}/${it.name}`);
          if (removes.length) {
            await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${bucket}`, {
              method: "DELETE",
              headers: { authorization: `Bearer ${serviceKey}`, "content-type": "application/json" },
              body: JSON.stringify(removes),
            }).catch(() => {});
          }
        }
      }).catch(() => {});
    } catch {}

    const uploadRes = await fetch(`${baseUrl}/${bucket}/${key}`, {
      method: "POST",
      headers: { authorization: `Bearer ${serviceKey}`, "x-upsert": "true" },
      body: (() => {
        const fd = new FormData();
        const view = new Uint8Array(out.buffer.buffer, out.buffer.byteOffset, out.buffer.byteLength);
        const ab = new ArrayBuffer(view.byteLength);
        new Uint8Array(ab).set(view);
        const blob = new Blob([ab], { type: out.mime });
        fd.append("file", blob, path.basename(key));
        return fd;
      })(),
    });
    if (!uploadRes.ok) {
      const txt = await uploadRes.text().catch(() => "");
      console.error("[avatar] upload fail: %s", txt);
      return NextResponse.json({ error: "storage_upload_failed", details: txt }, { status: 500 });
    }

    console.log("[avatar] done path=%s mime=%s", key, out.mime);
    return NextResponse.json({ path: key, mime: out.mime, ext: (out as ConvertResult).ext, crop: { x: cropX, y: cropY, w: cropW, h: cropH } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[avatar] error:", msg);
    return NextResponse.json({ error: "server_error", message: msg }, { status: 500 });
  }
}
