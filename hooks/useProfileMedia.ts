"use client";

import { toast } from "sonner";
import { finalizeAvatar, finalizeCover, presignAvatarUpload, presignCoverUpload, removeAvatar, removeCover } from "@/app/actions/storage";

// Utility: convert non-GIF images to WebP before upload
type ImageExt = "webp" | "gif" | "jpg" | "jpeg" | "png";

async function maybeConvertToWebP(file: File): Promise<{ blob: Blob; ext: ImageExt; mime: string }> {
  const type = (file.type || "").toLowerCase();
  const nameExt = (file.name.split(".").pop() || "").toLowerCase();
  const isGif = type === "image/gif" || nameExt === "gif";
  if (isGif) {
    return { blob: file, ext: "gif", mime: "image/gif" };
  }

  // Only convert raster images we can draw on canvas
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
  if (!ctx) return { blob: file, ext: (nameExt as ImageExt) || "jpg", mime: file.type || "image/jpeg" };
  ctx.drawImage(img, 0, 0);
  const quality = 0.9;
  const webpBlob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  if (!webpBlob) return { blob: file, ext: (nameExt as ImageExt) || "jpg", mime: file.type || "image/jpeg" };
  return { blob: webpBlob, ext: "webp", mime: "image/webp" };
}

export function useProfileMedia(userId?: string | null, onRefreshed?: () => Promise<void> | void) {
  // Upload using XHR to report progress for toasts
  function putWithProgress(url: string, body: Blob, contentType: string, onProgress?: (pct: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);
      xhr.setRequestHeader("Content-Type", contentType);
      xhr.upload.onprogress = (evt) => {
        if (!evt.lengthComputable) return;
        const pct = Math.min(100, Math.round((evt.loaded / evt.total) * 100));
        onProgress?.(pct);
      };
      xhr.onerror = () => reject(new Error("upload_error"));
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve(); else reject(new Error(`status_${xhr.status}`));
      };
      xhr.send(body);
    });
  }

  async function uploadCoverViaPicker() {
    if (!userId) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const converted = await maybeConvertToWebP(file);
      const { data, error } = await presignCoverUpload(userId, converted.ext as ImageExt);
      if (!data || error) { toast.error(error || "upload failed"); return; }
      const toastId = toast.loading("Uploading cover… 0%");
      try {
        await putWithProgress(data.url, converted.blob, converted.mime, (pct) => {
          toast(`Uploading cover… ${pct}%`, { id: toastId });
        });
      } catch {
        toast.error("Upload failed", { id: toastId });
        return;
      }
      toast("Finalizing…", { id: toastId });
      const fin = await finalizeCover(userId, data.path);
      if ((fin as { error?: string }).error) { toast.error((fin as { error?: string }).error || "update failed", { id: toastId }); return; }
      await Promise.resolve(onRefreshed?.());
      try { window.dispatchEvent(new CustomEvent("profile:updated")); } catch { }
      toast.success("Cover updated", { id: toastId });
    };
    input.click();
  }

  async function uploadAvatarViaPicker() {
    if (!userId) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const converted = await maybeConvertToWebP(file);
      const { data, error } = await presignAvatarUpload(userId, converted.ext as ImageExt);
      if (!data || error) { toast.error(error || "upload failed"); return; }
      const toastId = toast.loading("Uploading avatar… 0%");
      try {
        await putWithProgress(data.url, converted.blob, converted.mime, (pct) => {
          toast(`Uploading avatar… ${pct}%`, { id: toastId });
        });
      } catch {
        toast.error("Upload failed", { id: toastId });
        return;
      }
      toast("Finalizing…", { id: toastId });
      const fin = await finalizeAvatar(userId, data.path);
      if ((fin as { error?: string }).error) { toast.error((fin as { error?: string }).error || "update failed", { id: toastId }); return; }
      await Promise.resolve(onRefreshed?.());
      try { window.dispatchEvent(new CustomEvent("profile:updated")); } catch { }
      toast.success("Avatar updated", { id: toastId });
    };
    input.click();
  }

  // Upload from a cropped Data URL (PNG) coming from the ImageCrop component
  async function uploadAvatarFromCropped(dataUrl: string) {
    if (!userId) return;
    // Convert dataURL -> Blob -> File so we can reuse conversion pipeline
    const resp = await fetch(dataUrl);
    const blobPng = await resp.blob();
    const file = new File([blobPng], "avatar.png", { type: blobPng.type || "image/png" });
    const converted = await maybeConvertToWebP(file);
    const { data, error } = await presignAvatarUpload(userId, converted.ext as ImageExt);
    if (!data || error) { toast.error(error || "upload failed"); return; }
    const toastId = toast.loading("Uploading avatar… 0%");
    try {
      await putWithProgress(data.url, converted.blob, converted.mime, (pct) => {
        toast(`Uploading avatar… ${pct}%`, { id: toastId });
      });
    } catch {
      toast.error("Upload failed", { id: toastId });
      return;
    }
    toast("Finalizing…", { id: toastId });
    const fin = await finalizeAvatar(userId, data.path);
    if ((fin as { error?: string }).error) { toast.error((fin as { error?: string }).error || "update failed", { id: toastId }); return; }
    await Promise.resolve(onRefreshed?.());
    try { window.dispatchEvent(new CustomEvent("profile:updated")); } catch { }
    toast.success("Avatar updated", { id: toastId });
  }

  async function uploadCoverFromCropped(dataUrl: string) {
    if (!userId) return;
    const resp = await fetch(dataUrl);
    const blobPng = await resp.blob();
    const file = new File([blobPng], "cover.png", { type: blobPng.type || "image/png" });
    const converted = await maybeConvertToWebP(file);
    const { data, error } = await presignCoverUpload(userId, converted.ext as ImageExt);
    if (!data || error) { toast.error(error || "upload failed"); return; }
    const toastId = toast.loading("Uploading cover… 0%");
    try {
      await putWithProgress(data.url, converted.blob, converted.mime, (pct) => {
        toast(`Uploading cover… ${pct}%`, { id: toastId });
      });
    } catch {
      toast.error("Upload failed", { id: toastId });
      return;
    }
    toast("Finalizing…", { id: toastId });
    const fin = await finalizeCover(userId, data.path);
    if ((fin as { error?: string }).error) { toast.error((fin as { error?: string }).error || "update failed", { id: toastId }); return; }
    await Promise.resolve(onRefreshed?.());
    try { window.dispatchEvent(new CustomEvent("profile:updated")); } catch { }
    toast.success("Cover updated", { id: toastId });
  }

  async function removeCoverSafely() {
    if (!userId) return;
    const p = removeCover(userId);
    toast.promise(p, { loading: "Removing cover...", success: "Cover removed", error: "Failed to remove cover" });
    const r = await p;
    if (!(r as { error?: string }).error) {
      await Promise.resolve(onRefreshed?.());
      try { window.dispatchEvent(new CustomEvent("profile:updated")); } catch { }
    }
  }

  async function removeAvatarSafely() {
    if (!userId) return;
    const p = removeAvatar(userId);
    toast.promise(p, { loading: "Removing avatar...", success: "Avatar removed", error: "Failed to remove avatar" });
    const r = await p;
    if (!(r as { error?: string }).error) {
      await Promise.resolve(onRefreshed?.());
      try { window.dispatchEvent(new CustomEvent("profile:updated")); } catch { }
    }
  }

  return { uploadCoverViaPicker, uploadAvatarViaPicker, removeCoverSafely, removeAvatarSafely, uploadAvatarFromCropped, uploadCoverFromCropped };
}
