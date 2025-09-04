"use client";

import { toast } from "sonner";
import { finalizeAvatar, finalizeCover, removeAvatar, removeCover } from "@/app/actions/storage";
import { useMedia, type UploadResp } from "./useMedia";

// Backend handles all conversions; no client-side type mapping needed

export function useProfileMedia(userId?: string | null, onRefreshed?: () => Promise<void> | void) {
  const { uploadProfileAvatar, uploadProfileCover } = useMedia();

  async function uploadCoverViaPicker() {
    if (!userId) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const isGif = (file.type || "").toLowerCase() === "image/gif" || (file.name || "").toLowerCase().endsWith(".gif");
      if (isGif) {
        const fd = new FormData();
        fd.append("userId", userId);
        fd.append("file", file, file.name || "cover.gif");
        const toastId = toast.loading("Uploading cover… 0%");
        let json: UploadResp;
        try {
          json = await uploadProfileCover(fd, (pct) => {
            toast(`Uploading cover… ${pct}%`, { id: toastId });
          });
        } catch {
          toast.error("Upload failed", { id: toastId });
          return;
        }
        const fin = await finalizeCover(userId, json.url || json.path || "");
        if ((fin as { error?: string }).error) { toast.error((fin as { error?: string }).error || "update failed", { id: toastId }); return; }
        await Promise.resolve(onRefreshed?.());
        try { window.dispatchEvent(new CustomEvent("profile:updated")); } catch { }
        toast.success("Cover updated", { id: toastId });
        return;
      }
      const fd = new FormData();
      fd.append("userId", userId);
      fd.append("file", file, file.name || "cover");
      const toastId = toast.loading("Uploading cover… 0%");
      let json: UploadResp;
      try {
        json = await uploadProfileCover(fd, (pct) => {
          toast(`Uploading cover… ${pct}%`, { id: toastId });
        });
      } catch {
        toast.error("Upload failed", { id: toastId });
        return;
      }
      const fin = await finalizeCover(userId, json.url || json.path || "");
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
      const isGif = (file.type || "").toLowerCase() === "image/gif" || (file.name || "").toLowerCase().endsWith(".gif");
      if (isGif) {
        const fd = new FormData();
        fd.append("userId", userId);
        fd.append("file", file, file.name || "avatar.gif");
        const toastId = toast.loading("Uploading avatar… 0%");
        let json: UploadResp;
        try {
          json = await uploadProfileAvatar(fd, (pct) => {
            toast(`Uploading avatar… ${pct}%`, { id: toastId });
          });
        } catch {
          toast.error("Upload failed", { id: toastId });
          return;
        }
        const fin = await finalizeAvatar(userId, json.url || json.path || "");
        if ((fin as { error?: string }).error) { toast.error((fin as { error?: string }).error || "update failed", { id: toastId }); return; }
        await Promise.resolve(onRefreshed?.());
        try { window.dispatchEvent(new CustomEvent("profile:updated")); } catch { }
        toast.success("Avatar updated", { id: toastId });
        return;
      }
      const fd = new FormData();
      fd.append("userId", userId);
      fd.append("file", file, file.name || "avatar");
      const toastId = toast.loading("Uploading avatar… 0%");
      let json: UploadResp;
      try {
        json = await uploadProfileAvatar(fd, (pct) => {
          toast(`Uploading avatar… ${pct}%`, { id: toastId });
        });
      } catch {
        toast.error("Upload failed", { id: toastId });
        return;
      }
      const fin = await finalizeAvatar(userId, json.url || json.path || "");
      if ((fin as { error?: string }).error) { toast.error((fin as { error?: string }).error || "update failed", { id: toastId }); return; }
      await Promise.resolve(onRefreshed?.());
      try { window.dispatchEvent(new CustomEvent("profile:updated")); } catch { }
      toast.success("Avatar updated", { id: toastId });
    };
    input.click();
  }

  // Direct upload from a File (bypasses picker) — preserves GIF if provided
  async function uploadAvatarFromFile(file: File) {
    if (!userId) return;
    const isGif = (file.type || "").toLowerCase() === "image/gif" || (file.name || "").toLowerCase().endsWith(".gif");
    if (isGif) {
      const fd = new FormData();
      fd.append("userId", userId);
      fd.append("file", file, file.name || "avatar.gif");
      const toastId = toast.loading("Uploading avatar… 0%");
      let json: UploadResp;
      try {
        json = await uploadProfileAvatar(fd, (pct) => {
          toast(`Uploading avatar… ${pct}%`, { id: toastId });
        });
      } catch {
        toast.error("Upload failed", { id: toastId });
        return;
      }
      const fin = await finalizeAvatar(userId, json.url || json.path || "");
      if ((fin as { error?: string }).error) { toast.error((fin as { error?: string }).error || "update failed", { id: toastId }); return; }
      await Promise.resolve(onRefreshed?.());
      try { window.dispatchEvent(new CustomEvent("profile:updated")); } catch { }
      toast.success("Avatar updated", { id: toastId });
      return;
    }
    const fd = new FormData();
    fd.append("userId", userId);
    fd.append("file", file, file.name || "avatar");
    const toastId = toast.loading("Uploading avatar… 0%");
    let json: UploadResp;
    try {
      json = await uploadProfileAvatar(fd, (pct) => {
        toast(`Uploading avatar… ${pct}%`, { id: toastId });
      });
    } catch {
      toast.error("Upload failed", { id: toastId });
      return;
    }
    const fin = await finalizeAvatar(userId, json.url || json.path || "");
    if ((fin as { error?: string }).error) { toast.error((fin as { error?: string }).error || "update failed", { id: toastId }); return; }
    await Promise.resolve(onRefreshed?.());
    try { window.dispatchEvent(new CustomEvent("profile:updated")); } catch { }
    toast.success("Avatar updated", { id: toastId });
  }

  // Upload from a cropped Data URL (PNG) coming from the ImageCrop component
  async function uploadAvatarFromCropped(dataUrl: string) {
    if (!userId) return;
    // Convert dataURL -> Blob -> File and send to backend for processing
    const resp = await fetch(dataUrl);
    const blobPng = await resp.blob();
    const file = new File([blobPng], "avatar.png", { type: blobPng.type || "image/png" });
    const fd = new FormData();
    fd.append("userId", userId);
    fd.append("file", file, file.name);
    const toastId = toast.loading("Uploading avatar… 0%");
    let json: UploadResp;
    try {
      json = await uploadProfileAvatar(fd, (pct) => {
        toast(`Uploading avatar… ${pct}%`, { id: toastId });
      });
    } catch {
      toast.error("Upload failed", { id: toastId });
      return;
    }
    const fin = await finalizeAvatar(userId, json.url || json.path || "");
    if ((fin as { error?: string }).error) { toast.error((fin as { error?: string }).error || "update failed", { id: toastId }); return; }
    await Promise.resolve(onRefreshed?.());
    try { window.dispatchEvent(new CustomEvent("profile:updated")); } catch { }
    toast.success("Avatar updated", { id: toastId });
  }

  async function uploadCoverFromFile(file: File) {
    if (!userId) return;
    const isGif = (file.type || "").toLowerCase() === "image/gif" || (file.name || "").toLowerCase().endsWith(".gif");
    if (isGif) {
      const fd = new FormData();
      fd.append("userId", userId);
      fd.append("file", file, file.name || "cover.gif");
      const toastId = toast.loading("Uploading cover… 0%");
      let json: UploadResp;
      try {
        json = await uploadProfileCover(fd, (pct) => {
          toast(`Uploading cover… ${pct}%`, { id: toastId });
        });
      } catch {
        toast.error("Upload failed", { id: toastId });
        return;
      }
      const fin = await finalizeCover(userId, json.url || json.path || "");
      if ((fin as { error?: string }).error) { toast.error((fin as { error?: string }).error || "update failed", { id: toastId }); return; }
      await Promise.resolve(onRefreshed?.());
      try { window.dispatchEvent(new CustomEvent("profile:updated")); } catch { }
      toast.success("Cover updated", { id: toastId });
      return;
    }
    const fd = new FormData();
    fd.append("userId", userId);
    fd.append("file", file, file.name || "cover");
    const toastId = toast.loading("Uploading cover… 0%");
    let json: UploadResp;
    try {
      json = await uploadProfileCover(fd, (pct) => {
        toast(`Uploading cover… ${pct}%`, { id: toastId });
      });
    } catch {
      toast.error("Upload failed", { id: toastId });
      return;
    }
    const fin = await finalizeCover(userId, json.url || json.path || "");
    if ((fin as { error?: string }).error) { toast.error((fin as { error?: string }).error || "update failed", { id: toastId }); return; }
    await Promise.resolve(onRefreshed?.());
    try { window.dispatchEvent(new CustomEvent("profile:updated")); } catch { }
    toast.success("Cover updated", { id: toastId });
  }

  async function uploadCoverFromCropped(dataUrl: string) {
    if (!userId) return;
    const resp = await fetch(dataUrl);
    const blobPng = await resp.blob();
    const file = new File([blobPng], "cover.png", { type: blobPng.type || "image/png" });
    const fd = new FormData();
    fd.append("userId", userId);
    fd.append("file", file, file.name);
    const toastId = toast.loading("Uploading cover… 0%");
    let json: UploadResp;
    try {
      json = await uploadProfileCover(fd, (pct) => {
        toast(`Uploading cover… ${pct}%`, { id: toastId });
      });
    } catch {
      toast.error("Upload failed", { id: toastId });
      return;
    }
    const fin = await finalizeCover(userId, json.url || json.path || "");
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

  async function uploadGifAvatarWithCrop(file: File, crop: { x: number; y: number; w: number; h: number }) {
    if (!userId) return;
    const fd = new FormData();
    fd.append("userId", userId);
    fd.append("file", file, file.name || "avatar.gif");
    fd.append("crop_x", String(Math.max(0, Math.floor(crop.x))));
    fd.append("crop_y", String(Math.max(0, Math.floor(crop.y))));
    fd.append("crop_w", String(Math.max(1, Math.floor(crop.w))));
    fd.append("crop_h", String(Math.max(1, Math.floor(crop.h))));
    const toastId = toast.loading("Uploading avatar… 0%");
    let json: UploadResp;
    try {
      json = await uploadProfileAvatar(fd, (pct) => {
        toast(`Uploading avatar… ${pct}%`, { id: toastId });
      });
    } catch {
      toast.error("Upload failed", { id: toastId });
      return;
    }
    const fin = await finalizeAvatar(userId, json.url || json.path || "");
    if ((fin as { error?: string }).error) { toast.error((fin as { error?: string }).error || "update failed", { id: toastId }); return; }
    await Promise.resolve(onRefreshed?.());
    try { window.dispatchEvent(new CustomEvent("profile:updated")); } catch { }
    toast.success("Avatar updated", { id: toastId });
  }

  async function uploadGifCoverWithCrop(file: File, crop: { x: number; y: number; w: number; h: number }) {
    if (!userId) return;
    const fd = new FormData();
    fd.append("userId", userId);
    fd.append("file", file, file.name || "cover.gif");
    fd.append("crop_x", String(Math.max(0, Math.floor(crop.x))));
    fd.append("crop_y", String(Math.max(0, Math.floor(crop.y))));
    fd.append("crop_w", String(Math.max(1, Math.floor(crop.w))));
    fd.append("crop_h", String(Math.max(1, Math.floor(crop.h))));
    const toastId = toast.loading("Uploading cover… 0%");
    let json: UploadResp;
    try {
      json = await uploadProfileCover(fd, (pct) => {
        toast(`Uploading cover… ${pct}%`, { id: toastId });
      });
    } catch {
      toast.error("Upload failed", { id: toastId });
      return;
    }
    const fin = await finalizeCover(userId, json.url || json.path || "");
    if ((fin as { error?: string }).error) { toast.error((fin as { error?: string }).error || "update failed", { id: toastId }); return; }
    await Promise.resolve(onRefreshed?.());
    try { window.dispatchEvent(new CustomEvent("profile:updated")); } catch { }
    toast.success("Cover updated", { id: toastId });
  }

  return { uploadCoverViaPicker, uploadAvatarViaPicker, removeCoverSafely, removeAvatarSafely, uploadAvatarFromCropped, uploadCoverFromCropped, uploadAvatarFromFile, uploadCoverFromFile, uploadGifAvatarWithCrop, uploadGifCoverWithCrop };
}
