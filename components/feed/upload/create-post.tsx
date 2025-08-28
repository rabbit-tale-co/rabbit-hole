'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Image as ImageIcon, X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
// import type { Post } from '@/drizzle/schema';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { randomUUIDv7 } from '@/lib/uuid';

type OptimisticPost = {
  content?: string;
  images: { url: string; metadata?: unknown }[];
  user_id: string;
};

interface CreatePostProps {
  onPostCreated: (
    optimisticPost: OptimisticPost,
    realPost?: unknown,
    isError?: boolean
  ) => void;
  isPremium?: boolean;            // optional override
  fileSizeMbMax?: number;         // default 15
  formId?: string;                // external form target for header submit button
  onValidityChange?: (valid: boolean) => void; // inform parent to toggle header button
}

type ImgItem = { id: string; file: File; preview: string; alt: string };

export function CreatePost({
  onPostCreated,
  isPremium: isPremiumProp,
  fileSizeMbMax = 15,
  formId,
  onValidityChange,
}: CreatePostProps) {
  const { user } = useAuth();

  const isPremium = isPremiumProp ?? Boolean(user?.user_metadata?.is_premium);
  const MAX_IMAGES = isPremium ? 10 : 5;
  const MAX_CHARS = isPremium ? 1000 : 300;

  const [caption, setCaption] = useState('');
  const [items, setItems] = useState<ImgItem[]>([]);
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const overallProgress = useMemo(() => {
    if (items.length === 0) return 0;
    const values = items.map((i) => uploadProgress[i.id] ?? 0);
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round(sum / values.length);
  }, [items, uploadProgress]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [overDrop, setOverDrop] = useState(false);

  // --- helpers --------------------------------------------------------------

  const remaining = MAX_IMAGES - items.length;

  // Zod schema for validation (v4)
  const payloadSchema = useMemo(() => z.object({
    content: z.string().trim().max(MAX_CHARS, 'Too long').optional(),
    images: z.array(z.object({ url: z.string().min(1) })).min(1, 'At least one image').max(MAX_IMAGES, 'Too many images'),
  }), [MAX_CHARS, MAX_IMAGES]);

  const canSubmit = useMemo(() => {
    const res = payloadSchema.safeParse({
      content: caption.trim() || undefined,
      images: items.map(i => ({ url: i.preview })),
    });
    return res.success && !posting;
  }, [caption, items, posting, payloadSchema]);

  // notify parent about validity for header button state
  useEffect(() => {
    onValidityChange?.(canSubmit);
  }, [canSubmit, onValidityChange]);

  const addFiles = useCallback((filesLike: FileList | File[]) => {
    if (!user || !filesLike) return;

    const sizeLimit = fileSizeMbMax * 1024 * 1024;
    const files = Array.from(filesLike)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, Math.max(0, remaining));

    if (files.length === 0) {
      if (remaining <= 0) setErr(`You can upload up to ${MAX_IMAGES} images.`);
      return;
    }

    const sig = new Set(items.map(i => `${i.file.name}:${i.file.size}:${i.file.lastModified}`));
    const accepted: ImgItem[] = [];

    for (const f of files) {
      if (sig.has(`${f.name}:${f.size}:${f.lastModified}`)) continue;
      if (f.size > sizeLimit) {
        setErr(`"${f.name}" exceeds ${fileSizeMbMax}MB.`);
        continue;
      }
      accepted.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file: f,
        preview: URL.createObjectURL(f),
        alt: '',
      });
    }

    if (accepted.length) {
      setItems(prev => [...prev, ...accepted]);
      setErr(null);
    }
  }, [user, items, remaining, fileSizeMbMax, MAX_IMAGES]);

  const clearAll = () => {
    items.forEach(i => URL.revokeObjectURL(i.preview));
    setItems([]);
  };

  const removeAt = (idx: number) => {
    const itm = items[idx];
    if (itm) URL.revokeObjectURL(itm.preview);
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  // drag & drop reorder (super light)
  const onTileDragStart = (idx: number, e: React.DragEvent) => {
    setDragFrom(idx);
    e.dataTransfer.setData('text/plain', String(idx));
    e.dataTransfer.effectAllowed = 'move';
  };
  const onTileDrop = (idx: number, e: React.DragEvent) => {
    e.preventDefault();
    const from = dragFrom ?? Number(e.dataTransfer.getData('text/plain'));
    if (Number.isNaN(from) || from === idx) return;
    setItems(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      copy.splice(idx, 0, moved);
      return copy;
    });
    setDragFrom(null);
  };

  // paste support
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const onPaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const files = Array.from(e.clipboardData.files || []);
      if (files.length > 0) {
        e.preventDefault();
        addFiles(files);
      }
    };
    el.addEventListener('paste', onPaste);
    return () => el.removeEventListener('paste', onPaste);
  }, [addFiles]);

  // cleanup previews on unmount
  useEffect(() => () => items.forEach(i => URL.revokeObjectURL(i.preview)), [items]);

  // --- submit ---------------------------------------------------------------

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canSubmit) return;

    setPosting(true);
    setErr(null);

    const optimistic: OptimisticPost = {
      content: caption.trim() || undefined,
      images: items.map(i => ({ url: i.preview })),
      user_id: user.id,
    };

    try {
      // 1) upload each image with progress to Storage REST (authenticated)
      const metas: Array<{ id: string; path: string; alt: string; width: number; height: number; size_bytes: number; mime: "image/jpeg" | "image/png" | "image/webp"; }> = [];
      const postId = randomUUIDv7();
      const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object`;
      const bucket = 'social-art';
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      // helper to get a fresh auth token (avoids stale session causing 0% stall)
      const getToken = async () => {
        const { data: s1 } = await supabase.auth.getSession();
        if (s1.session?.access_token) return s1.session.access_token;
        try { await supabase.auth.refreshSession(); } catch { }
        const { data: s2 } = await supabase.auth.getSession();
        return s2.session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      };

      // initialize progress for all items to 1% so overall bar never shows 0%
      setUploadProgress(prev => {
        const next = { ...prev } as Record<string, number>;
        for (const it of items) next[it.id] = Math.max(1, next[it.id] ?? 1);
        return next;
      });

      // Upload each image with retry (handles auth errors) and initializes progress
      for (const it of items) {
        const imageId = randomUUIDv7();
        const ext = (it.file.name.split('.').pop() || 'png').toLowerCase();
        const key = `posts/${postId}/${imageId}.${ext}`;
        // compute dims from preview
        const dims = await new Promise<{ w: number; h: number }>((resolve) => {
          const im = document.createElement('img') as HTMLImageElement;
          im.onload = () => resolve({ w: im.naturalWidth || 0, h: im.naturalHeight || 0 });
          im.src = it.preview;
        });
        // multipart upload with progress + retry on 401/403
        await new Promise<void>(async (resolve, reject) => {
          const sendOnce = async (bearer: string, attempt: number) => {
            // initialize progress to 1% so UI does not look stuck before first tick
            setUploadProgress(prev => ({ ...prev, [it.id]: Math.max(1, prev[it.id] ?? 1) }));
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${baseUrl}/${bucket}/${key}`);
            xhr.setRequestHeader('authorization', `Bearer ${bearer}`);
            xhr.setRequestHeader('x-upsert', 'true');
            xhr.timeout = 120000; // 2 minutes per image
            xhr.upload.onprogress = (ev) => {
              const pct = ev.lengthComputable
                ? Math.round((ev.loaded / (ev.total || 1)) * 100)
                : 1; // keep at least 1% until first computable tick
              setUploadProgress(prev => ({ ...prev, [it.id]: pct }));
            };
            xhr.onerror = () => reject(new Error('storage_upload_failed'));
            xhr.ontimeout = () => reject(new Error('storage_upload_timeout'));
            xhr.onload = async () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                setUploadProgress(prev => ({ ...prev, [it.id]: 100 }));
                resolve();
              } else if ((xhr.status === 401 || xhr.status === 403) && attempt < 1) {
                const refreshed = await getToken();
                sendOnce(refreshed, attempt + 1);
              } else {
                reject(new Error(`storage_upload_status_${xhr.status}`));
              }
            };
            const fd = new FormData();
            fd.append('file', it.file, `${imageId}.${ext}`);
            xhr.send(fd);
          };
          const bearer = token || (await getToken());
          sendOnce(bearer, 0);
        });
        metas.push({
          id: imageId,
          path: key,
          alt: it.alt || '',
          width: Math.max(1, Math.min(10000, dims.w || 1)),
          height: Math.max(1, Math.min(10000, dims.h || 1)),
          size_bytes: it.file.size,
          mime: (it.file.type as "image/jpeg" | "image/png" | "image/webp") || 'image/png',
        });
      }

      // 2) optimistic UI
      onPostCreated(optimistic);

      // 3) create post
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          text: optimistic.content,
          images: metas,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create post');
      }

      const realPost = await res.json();
      onPostCreated(optimistic, realPost);

      // 4) reset
      setCaption('');
      clearAll();
      setUploadProgress({});
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e: unknown) {
      onPostCreated(optimistic, undefined, true);
      const message = e instanceof Error ? e.message : 'Something went wrong.';
      setErr(message);
    } finally {
      setPosting(false);
    }
  };

  if (!user) return null;

  // --- UI -------------------------------------------------------------------

  return (
    <form id={formId} ref={formRef} onSubmit={onSubmit} className="rounded-2xl bg-white ring-1 ring-border backdrop-blur-sm space-y-2">
      {/* Header */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, MAX_CHARS))}
            placeholder={(() => {
              const options = [
                'What are you working on right now?',
                "I'm working on…",
                'Share a quick note about these images…',
                'WIP thoughts, tools, brushes…',
              ];
              return options[Math.floor(Math.random() * options.length)];
            })()}
            className="min-h-[84px] shadow-none p-3 resize-none border-0 bg-transparent focus-visible:ring-0 text-[15px] leading-6"
            disabled={posting}
          />
          <div className="mt-1 flex px-3 items-center justify-between text-[11px] text-muted-foreground">
            <span>{caption.trim().length}/{MAX_CHARS} chars</span>
            {!isPremium && <span className="opacity-70">Upgrade to post more</span>}
          </div>
        </div>
      </div>

      <div className="p-3">
        {/* Dropzone / Grid */}
        <div
          onDragOver={(e) => { e.preventDefault(); setOverDrop(true); }}
          onDragLeave={() => setOverDrop(false)}
          onDrop={(e) => { e.preventDefault(); setOverDrop(false); addFiles(e.dataTransfer.files); }}
          className={[
            'rounded-xl border border-dashed p-4 transition-colors cursor-pointer bg-neutral-50 hover:bg-neutral-100',
            overDrop ? 'border-primary/50' : 'border-border'
          ].join(' ')}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          {/* hidden input always present */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              addFiles(e.target.files || []);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="hidden"
          />
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <div className="rounded-full bg-background/70 border border-border p-2">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-sm text-muted-foreground">
                Drag & drop images, paste (Ctrl/Cmd+V), or <span className="underline underline-offset-2">browse</span>
              </div>
              <div className="text-[11px] text-muted-foreground/80">
                {MAX_IMAGES} images max • {fileSizeMbMax}MB each
              </div>
            </div>
          ) : (
            <>
              {posting && (
                <div className="mb-2">
                  <div className="h-1 w-full bg-black/10 rounded">
                    <div className="h-1 bg-primary/80 rounded" style={{ width: `${overallProgress}%` }} />
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">Uploading… {overallProgress}%</div>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {items.map((it, idx) => (
                  <div
                    key={it.id}
                    draggable
                    onDragStart={(e) => onTileDragStart(idx, e)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onTileDrop(idx, e)}
                    className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black/5 border border-border/60 group select-none"
                    style={{ cursor: 'grab' }}
                  >
                    <Image
                      src={it.preview}
                      alt={it.alt || `Image ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {uploadProgress[it.id] !== undefined && (
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20">
                        <div
                          className="h-full bg-primary/80"
                          style={{ width: `${uploadProgress[it.id]}%` }}
                        />
                      </div>
                    )}

                    {/* number pill */}
                    <div className="absolute top-1 left-1 text-[10px] rounded-full bg-background/80 border border-border px-1.5 py-0.5">
                      {idx + 1}
                    </div>

                    {/* remove */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeAt(idx); }}
                      className="absolute top-1.5 right-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-background/80 border border-border text-muted-foreground hover:text-foreground transition-opacity opacity-0 group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    {/* ALT editor */}
                    <div className="absolute inset-x-1 bottom-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <input
                        type="text"
                        value={it.alt}
                        onChange={(e) => setItems(prev => prev.map((p, i) => i === idx ? { ...p, alt: e.target.value.slice(0, 140) } : p))}
                        placeholder="Describe this image (alt)"
                        className="w-full rounded-md bg-black/60 text-white text-[11px] px-2 py-1 outline-none placeholder:text-white/70"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div className="text-[12px] text-muted-foreground">{items.length}/{MAX_IMAGES} images</div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="hover:bg-neutral-200"
                    disabled={posting || items.length >= MAX_IMAGES}
                  >
                    Add more
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="hover:bg-neutral-200"
                    onClick={(e) => { e.stopPropagation(); clearAll(); }}
                    disabled={posting || items.length === 0}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error */}

      {err && (
        <div className="pb-3 px-3">
          <div className="text-[12px] text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
            {err}
          </div>
        </div>
      )}
    </form>
  );
}
