"use client";

export type UploadResp = { path?: string; url?: string };

export function useMedia() {
  const MEDIA_API = process.env.NEXT_PUBLIC_BACKEND || process.env.NEXT_PUBLIC_MEDIA_API_URL || "https://api.rabbittale.co";

  function buildUrl(path: string): string {
    const p = path.replace(/^\/?/, "");
    return `${MEDIA_API}/social/v1/${p}`;
  }

  function postFormWithProgress(url: string, formData: FormData, onProgress?: (pct: number) => void): Promise<UploadResp> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.withCredentials = false;
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

  function uploadProfileAvatar(fd: FormData, onProgress?: (pct: number) => void) {
    return postFormWithProgress(buildUrl("profile/avatar"), fd, onProgress);
  }

  function uploadProfileCover(fd: FormData, onProgress?: (pct: number) => void) {
    return postFormWithProgress(buildUrl("profile/cover"), fd, onProgress);
  }

  function uploadPostMedia(fd: FormData, onProgress?: (pct: number) => void) {
    return postFormWithProgress(buildUrl("post/upload"), fd, onProgress);
  }

  return { MEDIA_API, buildUrl, postFormWithProgress, uploadProfileAvatar, uploadProfileCover, uploadPostMedia };
}
