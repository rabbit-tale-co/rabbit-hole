"use client";

import { toast } from "sonner";
import type { UploadResp } from "./useMedia";

// Upload + finalize helpers for Rabbit Holes (analogicznie do useProfileMedia)
// Backend konwertuje pliki; my tylko wysylamy i zapisujemy URL w bazie przez lokalne API

export function useRabbitHoleMedia(
  rabbitHoleId: string,
  rabbitHoleUrl: string,
  onRefreshed?: () => Promise<void> | void,
) {
  const S3_ENDPOINT = (process.env.NEXT_PUBLIC_S3_ENDPOINT || "").replace(/\/$/, "");

  function toAbsoluteUrl(u: string): string {
    if (!u) return u;
    // If it's already a full URL, return as-is
    if (/^https?:\/\//i.test(u)) {
      return u;
    }
    // If it looks like a domain without protocol, add https://
    if (u.includes('.') && !u.startsWith('/')) {
      return `https://${u}`;
    }
    // Only prefix if it's a relative path
    const result = S3_ENDPOINT ? `${S3_ENDPOINT}/${u.replace(/^\/?/, "")}` : u;
    return result;
  }
  async function uploadWithAuth(
    endpoint: string,
    formData: FormData,
    getToken: () => Promise<string | null>,
    onProgress?: (pct: number) => void,
  ): Promise<UploadResp> {
    const token = await getToken();
    if (!token) throw new Error("No authentication token available");
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", endpoint, true);
      xhr.withCredentials = false;
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.upload.onprogress = (evt) => {
        if (!evt.lengthComputable) return;
        const pct = Math.min(100, Math.round((evt.loaded / evt.total) * 100));
        onProgress?.(pct);
      };
      xhr.responseType = "json";
      xhr.onerror = () => reject(new Error("upload_error"));
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response as UploadResp);
        else reject(new Error(`status_${xhr.status}`));
      };
      xhr.send(formData);
    });
  }

  async function getToken(): Promise<string | null> {
    const { supabase } = await import("@/lib/supabase");
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  async function patchImages(payload: { avatar_url?: string | null; cover_url?: string | null }, overrides?: { id?: string }) {
    const token = await getToken();
    if (!token) return;
    await fetch("/api/rabbit-holes/update-images", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ rabbit_hole_id: overrides?.id || rabbitHoleId, ...payload }),
    }).catch(() => {});
  }

  async function uploadAvatarFromFile(file: File, overrides?: { id?: string; url?: string }) {
    const fd = new FormData();
    fd.append("file", file, file.name || "avatar");
    let resp: UploadResp;
    try {
      const urlSeg = overrides?.url || rabbitHoleUrl;
      resp = await uploadWithAuth(`/api/rabbit-holes/${encodeURIComponent(urlSeg)}/avatar`, fd, getToken);
    } catch {
      return;
    }
    // Backend returns full URL in resp.url, use it directly
    const final = resp.url || toAbsoluteUrl(resp.path || "");
    if (final) await patchImages({ avatar_url: final }, { id: overrides?.id });
    await Promise.resolve(onRefreshed?.());
  }

  async function uploadCoverFromFile(file: File, overrides?: { id?: string; url?: string }) {
    const fd = new FormData();
    fd.append("file", file, file.name || "cover");
    let resp: UploadResp;
    try {
      const urlSeg = overrides?.url || rabbitHoleUrl;
      resp = await uploadWithAuth(`/api/rabbit-holes/${encodeURIComponent(urlSeg)}/cover`, fd, getToken);
    } catch {
      return;
    }
    // Backend returns full URL in resp.url, use it directly
    const final = resp.url || toAbsoluteUrl(resp.path || "");
    if (final) await patchImages({ cover_url: final }, { id: overrides?.id });
    await Promise.resolve(onRefreshed?.());
  }

  async function uploadAvatarFromCropped(blob: Blob, overrides?: { id?: string; url?: string }) {
    const file = new File([blob], "avatar.png", { type: blob.type || "image/png" });
    return uploadAvatarFromFile(file, overrides);
  }

  async function uploadCoverFromCropped(blob: Blob, overrides?: { id?: string; url?: string }) {
    const file = new File([blob], "cover.png", { type: blob.type || "image/png" });
    return uploadCoverFromFile(file, overrides);
  }

  async function removeAvatar() {
    await patchImages({ avatar_url: null });
    await Promise.resolve(onRefreshed?.());
  }

  async function removeCover() {
    await patchImages({ cover_url: null });
    await Promise.resolve(onRefreshed?.());
  }

  return {
    uploadAvatarFromFile,
    uploadCoverFromFile,
    uploadAvatarFromCropped,
    uploadCoverFromCropped,
    removeAvatar,
    removeCover,
  };
}
