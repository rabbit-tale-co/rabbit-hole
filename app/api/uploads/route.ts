import { NextResponse } from 'next/server';
import { randomUUIDv7 } from '@/lib/uuid';
import sharp from 'sharp';
import path from 'path';
import os from 'os';
import { promises as fs } from 'fs';
// dynamic import to avoid build errors if optional dep is missing
let ffmpegPath: string | null = null;
try {
  const mod = await import('ffmpeg-static');
  ffmpegPath = (mod as unknown as { default?: string }).default || (mod as unknown as string);
} catch {
  ffmpegPath = null;
}
import { execFile } from 'child_process';
import { promisify } from 'util';

export const runtime = 'nodejs';

const execFileAsync = promisify(execFile);

async function convertImage(buffer: Buffer, mime: string) {
  const isGif = mime === 'image/gif';
  if (isGif) {
    return { buffer, ext: 'gif', outMime: 'image/gif', width: 0, height: 0 };
  }
  const img = sharp(buffer);
  const meta = await img.metadata();
  const webp = await img.webp({ quality: 90 }).toBuffer();
  return { buffer: webp, ext: 'webp', outMime: 'image/webp', width: meta.width || 0, height: meta.height || 0 };
}

async function convertVideo(buffer: Buffer, originalMime?: string, originalExt?: string) {
  if (!ffmpegPath || typeof ffmpegPath !== 'string') {
    // Fallback: return original
    return { buffer, ext: (originalExt || 'mp4'), outMime: (originalMime || 'video/mp4') };
  }
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'upload-'));
  const inPath = path.join(tmpDir, 'in');
  const outPath = path.join(tmpDir, 'out.webm');
  await fs.writeFile(inPath, buffer);
  try {
    await execFileAsync(ffmpegPath, [
      '-y',
      '-i', inPath,
      '-c:v', 'libvpx-vp9',
      '-b:v', '0',
      '-crf', '32',
      '-pix_fmt', 'yuv420p',
      '-an',
      outPath,
    ], { maxBuffer: 1024 * 1024 * 32 });
    const out = await fs.readFile(outPath);
    return { buffer: out, ext: 'webm', outMime: 'video/webm' };
  } catch {
    // If ffmpeg spawn failed (ENOENT) or any error, send original
    return { buffer, ext: (originalExt || 'mp4'), outMime: (originalMime || 'video/mp4') };
  } finally {
    fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const postId = String(form.get('postId') || randomUUIDv7());
    const kind = String(form.get('kind') || 'image');
    const width = Number(form.get('width') || 0);
    const height = Number(form.get('height') || 0);
    const isCover = String(form.get('isCover') || 'false') === 'true';
    const alt = String(form.get('alt') || '');
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const input = Buffer.from(arrayBuffer);

    let outBuf: Buffer = input;
    let ext = 'bin';
    let outMime = file.type || 'application/octet-stream';
    let outWidth = width;
    let outHeight = height;

    if (kind === 'video') {
      const nameExt = (file.name.split('.').pop() || '').toLowerCase() || undefined;
      const v = await convertVideo(input, file.type || 'video/mp4', nameExt);
      outBuf = v.buffer; ext = v.ext; outMime = v.outMime;
      // derive basic dims for video using ffprobe-like approach is heavy; trust client-probed when provided
    } else {
      const im = await convertImage(input, file.type || 'image/jpeg');
      outBuf = im.buffer; ext = im.ext; outMime = im.outMime; outWidth ||= im.width; outHeight ||= im.height;
    }

    const bucket = 'social-art';
    const imageId = randomUUIDv7();
    const key = `posts/${postId}/${imageId}.${ext}`;
    const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object`;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
    if (!baseUrl || !serviceKey) return NextResponse.json({ error: 'Missing Supabase env' }, { status: 500 });

    const uploadRes = await fetch(`${baseUrl}/${bucket}/${key}`, {
      method: 'POST',
      headers: { 'authorization': `Bearer ${serviceKey}`, 'x-upsert': 'true' },
      body: (() => {
        const fd = new FormData();
        // Build a typed-array view over the Buffer (ArrayBufferLike) and pass that to Blob
        const view = new Uint8Array(outBuf.buffer, outBuf.byteOffset, outBuf.byteLength);
        // Create a standalone ArrayBuffer (not SharedArrayBuffer) and copy bytes
        const ab = new ArrayBuffer(view.byteLength);
        new Uint8Array(ab).set(view);
        const blob = new Blob([ab], { type: outMime });
        fd.append('file', blob, path.basename(key));
        return fd;
      })(),
    });
    if (!uploadRes.ok) {
      const txt = await uploadRes.text().catch(() => '');
      return NextResponse.json({ error: 'storage_upload_failed', status: uploadRes.status, details: txt }, { status: 500 });
    }

    return NextResponse.json({
      id: imageId,
      path: key,
      alt,
      width: Math.max(1, Math.min(10000, outWidth || 1)),
      height: Math.max(1, Math.min(10000, outHeight || 1)),
      size_bytes: outBuf.length,
      mime: outMime,
      is_cover: isCover,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: 'server_error', message: msg }, { status: 500 });
  }
}
