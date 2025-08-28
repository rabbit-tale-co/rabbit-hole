"use client";

export type ConvertedBlob = { blob: Blob; ext: "webp" | "gif" | "jpg" | "jpeg" | "png" | "webm"; mime: string };

// Convert raster images to WebP while preserving GIFs
export async function convertImageToWebP(file: File): Promise<ConvertedBlob> {
  const type = (file.type || "").toLowerCase();
  const nameExt = (file.name.split(".").pop() || "").toLowerCase();
  const isGif = type === "image/gif" || nameExt === "gif";
  if (isGif) {
    return { blob: file, ext: "gif", mime: "image/gif" };
  }
  const img = document.createElement("img");
  const reader = new FileReader();
  const dataUrl: string = await new Promise<string>((resolve, reject) => {
    reader.onerror = () => reject(new Error("read_error"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("image_load_error"));
    img.src = dataUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { blob: file, ext: (nameExt as "webp" | "gif" | "jpg" | "jpeg" | "png") || "jpg", mime: file.type || "image/jpeg" };
  ctx.drawImage(img, 0, 0);
  const quality = 0.9;
  const webpBlob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  if (!webpBlob) return { blob: file, ext: (nameExt as "webp" | "gif" | "jpg" | "jpeg" | "png") || "jpg", mime: file.type || "image/jpeg" };
  return { blob: webpBlob, ext: "webp", mime: "image/webp" };
}

// Attempt to convert a video to WebM (VP8/VP9) using MediaRecorder when supported
export async function convertVideoToWebM(file: File): Promise<ConvertedBlob> {
  const type = (file.type || "").toLowerCase();
  if (type === "video/webm") return { blob: file, ext: "webm", mime: "video/webm" };

  // Fallback to original if MediaRecorder or captureStream is not available
  const canRecord = typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.("video/webm;codecs=vp8") === true;
  if (!canRecord) {
    return { blob: file, ext: "webm", mime: "video/webm" };
  }

  const videoUrl = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    await video.play().catch(() => {});
    await new Promise<void>((resolve) => (video.onloadeddata = () => resolve()));
    const stream = (video as unknown as { captureStream?: () => MediaStream }).captureStream?.() as MediaStream | undefined;
    if (!stream) {
      return { blob: file, ext: "webm", mime: "video/webm" };
    }
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp8" });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };
    const stopped = new Promise<void>((resolve) => { recorder.onstop = () => resolve(); });
    recorder.start();
    await video.play().catch(() => {});
    await new Promise<void>((resolve) => (video.onended = () => resolve()));
    recorder.stop();
    await stopped;
    const blob = new Blob(chunks, { type: "video/webm" });
    return { blob, ext: "webm", mime: "video/webm" };
  } finally {
    URL.revokeObjectURL(videoUrl);
  }
}
