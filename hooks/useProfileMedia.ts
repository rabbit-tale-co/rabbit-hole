"use client";

import { toast } from "sonner";
import {
	finalizeAvatar,
	finalizeCover,
	removeAvatar,
	removeCover,
} from "@/app/actions/storage";
import { supabase } from "@/lib/supabase";
import type { UploadResp } from "./useMedia";

// Backend handles all conversions; no client-side type mapping needed

export function useProfileMedia(
	userId?: string | null,
	onRefreshed?: () => Promise<void> | void,
) {
	// We don't need useMedia anymore since we're using local API endpoints

	// Helper function to get JWT token
	async function getAuthToken(): Promise<string | null> {
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			return session?.access_token || null;
		} catch (error) {
			console.error("Failed to get auth token:", error);
			return null;
		}
	}

	// Helper function to upload with JWT token
	async function uploadWithAuth(
		endpoint: string,
		formData: FormData,
		onProgress?: (pct: number) => void,
	): Promise<UploadResp> {
		const token = await getAuthToken();
		if (!token) {
			throw new Error("No authentication token available");
		}

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
				if (xhr.status >= 200 && xhr.status < 300) {
					resolve(xhr.response as UploadResp);
				} else {
					reject(new Error(`status_${xhr.status}`));
				}
			};
			xhr.send(formData);
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

			const isGif =
				(file.type || "").toLowerCase() === "image/gif" ||
				(file.name || "").toLowerCase().endsWith(".gif");

			if (isGif) {
				const fd = new FormData();
				fd.append("userId", userId);
				fd.append("file", file, file.name || "cover.gif");
				const toastId = toast.loading("Uploading cover… 0%");
				let json: UploadResp;

				try {
					json = await uploadWithAuth("/api/profile/cover", fd, (pct) => {
						toast(`Uploading cover… ${pct}%`, { id: toastId });
					});
				} catch {
					toast.error("Upload failed", { id: toastId });
					return;
				}
				const fin = await finalizeCover(userId, json.url || json.path || "");
				if ((fin as { error?: string }).error) {
					toast.error((fin as { error?: string }).error || "update failed", {
						id: toastId,
					});
					return;
				}
				await Promise.resolve(onRefreshed?.());
				try {
					window.dispatchEvent(new CustomEvent("profile:updated"));
				} catch {}
				toast.success("Cover updated", { id: toastId });
				return;
			}
			const fd = new FormData();
			fd.append("userId", userId);
			fd.append("file", file, file.name || "cover");
			const toastId = toast.loading("Uploading cover… 0%");
			let json: UploadResp;
			try {
				json = await uploadWithAuth("/api/profile/cover", fd, (pct) => {
					toast(`Uploading cover… ${pct}%`, { id: toastId });
				});
			} catch {
				toast.error("Upload failed", { id: toastId });
				return;
			}
			const fin = await finalizeCover(userId, json.url || json.path || "");
			if ((fin as { error?: string }).error) {
				toast.error((fin as { error?: string }).error || "update failed", {
					id: toastId,
				});
				return;
			}
			await Promise.resolve(onRefreshed?.());
			try {
				window.dispatchEvent(new CustomEvent("profile:updated"));
			} catch {}
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
			const isGif =
				(file.type || "").toLowerCase() === "image/gif" ||
				(file.name || "").toLowerCase().endsWith(".gif");
			if (isGif) {
				const fd = new FormData();
				fd.append("userId", userId);
				fd.append("file", file, file.name || "avatar.gif");
				const toastId = toast.loading("Uploading avatar… 0%");
				let json: UploadResp;
				try {
					json = await uploadWithAuth("/api/profile/avatar", fd, (pct) => {
						toast(`Uploading avatar… ${pct}%`, { id: toastId });
					});
				} catch {
					toast.error("Upload failed", { id: toastId });
					return;
				}
				const fin = await finalizeAvatar(userId, json.url || json.path || "");
				if ((fin as { error?: string }).error) {
					toast.error((fin as { error?: string }).error || "update failed", {
						id: toastId,
					});
					return;
				}
				await Promise.resolve(onRefreshed?.());
				try {
					window.dispatchEvent(new CustomEvent("profile:updated"));
				} catch {}
				toast.success("Avatar updated", { id: toastId });
				return;
			}
			const fd = new FormData();
			fd.append("userId", userId);
			fd.append("file", file, file.name || "avatar");
			const toastId = toast.loading("Uploading avatar… 0%");
			let json: UploadResp;
			try {
				json = await uploadWithAuth("/api/profile/avatar", fd, (pct) => {
					toast(`Uploading avatar… ${pct}%`, { id: toastId });
				});
			} catch {
				toast.error("Upload failed", { id: toastId });
				return;
			}
			const fin = await finalizeAvatar(userId, json.url || json.path || "");
			if ((fin as { error?: string }).error) {
				toast.error((fin as { error?: string }).error || "update failed", {
					id: toastId,
				});
				return;
			}
			await Promise.resolve(onRefreshed?.());
			try {
				window.dispatchEvent(new CustomEvent("profile:updated"));
			} catch {}
			toast.success("Avatar updated", { id: toastId });
		};
		input.click();
	}

	// Direct upload from a File (bypasses picker) — preserves GIF if provided
	async function uploadAvatarFromFile(file: File) {
		if (!userId) return;
		const isGif =
			(file.type || "").toLowerCase() === "image/gif" ||
			(file.name || "").toLowerCase().endsWith(".gif");
		if (isGif) {
			const fd = new FormData();
			fd.append("userId", userId);
			fd.append("file", file, file.name || "avatar.gif");
			const toastId = toast.loading("Uploading avatar… 0%");
			let json: UploadResp;
			try {
				json = await uploadWithAuth("/api/profile/avatar", fd, (pct) => {
					toast(`Uploading avatar… ${pct}%`, { id: toastId });
				});
			} catch {
				toast.error("Upload failed", { id: toastId });
				return;
			}
			const fin = await finalizeAvatar(userId, json.url || json.path || "");
			if ((fin as { error?: string }).error) {
				toast.error((fin as { error?: string }).error || "update failed", {
					id: toastId,
				});
				return;
			}
			await Promise.resolve(onRefreshed?.());
			try {
				window.dispatchEvent(new CustomEvent("profile:updated"));
			} catch {}
			toast.success("Avatar updated", { id: toastId });
			return;
		}
		const fd = new FormData();
		fd.append("userId", userId);
		fd.append("file", file, file.name || "avatar");
		const toastId = toast.loading("Uploading avatar… 0%");
		let json: UploadResp;
		try {
			json = await uploadWithAuth("/api/profile/avatar", fd, (pct: number) => {
				toast(`Uploading avatar… ${pct}%`, { id: toastId });
			});
		} catch {
			toast.error("Upload failed", { id: toastId });
			return;
		}
		const fin = await finalizeAvatar(userId, json.url || json.path || "");
		if ((fin as { error?: string }).error) {
			toast.error((fin as { error?: string }).error || "update failed", {
				id: toastId,
			});
			return;
		}
		await Promise.resolve(onRefreshed?.());
		try {
			window.dispatchEvent(new CustomEvent("profile:updated"));
		} catch {}
		toast.success("Avatar updated", { id: toastId });
	}

	// Upload from a cropped Blob coming from the ImageCrop component
	async function uploadAvatarFromCropped(blob: Blob) {
		if (!userId) return;
		console.log("[AVATAR] Uploading cropped avatar:", {
			userId,
			blobSize: blob.size,
			blobType: blob.type,
			timestamp: new Date().toISOString(),
		});
		// Convert Blob -> File and send to backend for processing
		const extension = blob.type.includes("webp") ? "webp" : "png";
		const file = new File([blob], `avatar.${extension}`, {
			type: blob.type || "image/png",
		});
		const fd = new FormData();
		fd.append("userId", userId);
		fd.append("file", file, file.name);
		const toastId = toast.loading("Uploading avatar… 0%");
		let json: UploadResp;
		try {
			console.log("[AVATAR] Starting upload to /api/profile/avatar");
			json = await uploadWithAuth("/api/profile/avatar", fd, (pct: number) => {
				toast(`Uploading avatar… ${pct}%`, { id: toastId });
			});
			console.log("[AVATAR] Upload successful:", json);
		} catch (error) {
			console.error("[AVATAR] Upload failed:", error);
			toast.error("Upload failed", { id: toastId });
			return;
		}
		const fin = await finalizeAvatar(userId, json.url || json.path || "");
		if ((fin as { error?: string }).error) {
			toast.error((fin as { error?: string }).error || "update failed", {
				id: toastId,
			});
			return;
		}
		await Promise.resolve(onRefreshed?.());
		try {
			window.dispatchEvent(new CustomEvent("profile:updated"));
		} catch {}
		toast.success("Avatar updated", { id: toastId });
	}

	async function uploadCoverFromFile(file: File) {
		if (!userId) return;
		const isGif =
			(file.type || "").toLowerCase() === "image/gif" ||
			(file.name || "").toLowerCase().endsWith(".gif");
		if (isGif) {
			const fd = new FormData();
			fd.append("userId", userId);
			fd.append("file", file, file.name || "cover.gif");
			const toastId = toast.loading("Uploading cover… 0%");
			let json: UploadResp;
			try {
				json = await uploadWithAuth("/api/profile/cover", fd, (pct) => {
					toast(`Uploading cover… ${pct}%`, { id: toastId });
				});
			} catch {
				toast.error("Upload failed", { id: toastId });
				return;
			}
			const fin = await finalizeCover(userId, json.url || json.path || "");
			if ((fin as { error?: string }).error) {
				toast.error((fin as { error?: string }).error || "update failed", {
					id: toastId,
				});
				return;
			}
			await Promise.resolve(onRefreshed?.());
			try {
				window.dispatchEvent(new CustomEvent("profile:updated"));
			} catch {}
			toast.success("Cover updated", { id: toastId });
			return;
		}
		const fd = new FormData();
		fd.append("userId", userId);
		fd.append("file", file, file.name || "cover");
		const toastId = toast.loading("Uploading cover… 0%");
		let json: UploadResp;
		try {
			json = await uploadWithAuth("/api/profile/cover", fd, (pct: number) => {
				toast(`Uploading cover… ${pct}%`, { id: toastId });
			});
		} catch {
			toast.error("Upload failed", { id: toastId });
			return;
		}
		const fin = await finalizeCover(userId, json.url || json.path || "");
		if ((fin as { error?: string }).error) {
			toast.error((fin as { error?: string }).error || "update failed", {
				id: toastId,
			});
			return;
		}
		await Promise.resolve(onRefreshed?.());
		try {
			window.dispatchEvent(new CustomEvent("profile:updated"));
		} catch {}
		toast.success("Cover updated", { id: toastId });
	}

	async function uploadCoverFromCropped(blob: Blob) {
		if (!userId) return;
		console.log("[COVER] Uploading cropped cover:", {
			userId,
			blobSize: blob.size,
			blobType: blob.type,
			timestamp: new Date().toISOString(),
		});
		const extension = blob.type.includes("webp") ? "webp" : "png";
		const file = new File([blob], `cover.${extension}`, {
			type: blob.type || "image/png",
		});
		const fd = new FormData();
		fd.append("userId", userId);
		fd.append("file", file, file.name);
		const toastId = toast.loading("Uploading cover… 0%");
		let json: UploadResp;
		try {
			console.log("[COVER] Starting upload to /api/profile/cover");
			json = await uploadWithAuth("/api/profile/cover", fd, (pct: number) => {
				toast(`Uploading cover… ${pct}%`, { id: toastId });
			});
			console.log("[COVER] Upload successful:", json);
		} catch (error) {
			console.error("[COVER] Upload failed:", error);
			toast.error("Upload failed", { id: toastId });
			return;
		}
		const fin = await finalizeCover(userId, json.url || json.path || "");
		if ((fin as { error?: string }).error) {
			toast.error((fin as { error?: string }).error || "update failed", {
				id: toastId,
			});
			return;
		}
		await Promise.resolve(onRefreshed?.());
		try {
			window.dispatchEvent(new CustomEvent("profile:updated"));
		} catch {}
		toast.success("Cover updated", { id: toastId });
	}

	async function removeCoverSafely() {
		if (!userId) return;
		const p = removeCover(userId);
		toast.promise(p, {
			loading: "Removing cover...",
			success: "Cover removed",
			error: "Failed to remove cover",
		});
		const r = await p;
		if (!(r as { error?: string }).error) {
			await Promise.resolve(onRefreshed?.());
			try {
				window.dispatchEvent(new CustomEvent("profile:updated"));
			} catch {}
		}
	}

	async function removeAvatarSafely() {
		if (!userId) return;
		const p = removeAvatar(userId);
		toast.promise(p, {
			loading: "Removing avatar...",
			success: "Avatar removed",
			error: "Failed to remove avatar",
		});
		const r = await p;
		if (!(r as { error?: string }).error) {
			await Promise.resolve(onRefreshed?.());
			try {
				window.dispatchEvent(new CustomEvent("profile:updated"));
			} catch {}
		}
	}

	async function uploadGifAvatarWithCrop(
		file: File,
		crop: { x: number; y: number; w: number; h: number },
	) {
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
			json = await uploadWithAuth("/api/profile/avatar", fd, (pct: number) => {
				toast(`Uploading avatar… ${pct}%`, { id: toastId });
			});
		} catch {
			toast.error("Upload failed", { id: toastId });
			return;
		}
		const fin = await finalizeAvatar(userId, json.url || json.path || "");
		if ((fin as { error?: string }).error) {
			toast.error((fin as { error?: string }).error || "update failed", {
				id: toastId,
			});
			return;
		}
		await Promise.resolve(onRefreshed?.());
		try {
			window.dispatchEvent(new CustomEvent("profile:updated"));
		} catch {}
		toast.success("Avatar updated", { id: toastId });
	}

	async function uploadGifCoverWithCrop(
		file: File,
		crop: { x: number; y: number; w: number; h: number },
	) {
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
			json = await uploadWithAuth("/api/profile/cover", fd, (pct: number) => {
				toast(`Uploading cover… ${pct}%`, { id: toastId });
			});
		} catch {
			toast.error("Upload failed", { id: toastId });
			return;
		}
		const fin = await finalizeCover(userId, json.url || json.path || "");
		if ((fin as { error?: string }).error) {
			toast.error((fin as { error?: string }).error || "update failed", {
				id: toastId,
			});
			return;
		}
		await Promise.resolve(onRefreshed?.());
		try {
			window.dispatchEvent(new CustomEvent("profile:updated"));
		} catch {}
		toast.success("Cover updated", { id: toastId });
	}

	return {
		uploadCoverViaPicker,
		uploadAvatarViaPicker,
		removeCoverSafely,
		removeAvatarSafely,
		uploadAvatarFromCropped,
		uploadCoverFromCropped,
		uploadAvatarFromFile,
		uploadCoverFromFile,
		uploadGifAvatarWithCrop,
		uploadGifCoverWithCrop,
	};
}
