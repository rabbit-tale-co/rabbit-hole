'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
// import { convertImageToWebP, convertVideoToWebM } from '@/lib/media';
import { randomUUIDv7 } from '@/lib/uuid';
import { useAuth } from '@/providers/AuthProvider';
import { Sortable, SortableItem, SortableItemHandle } from '@/components/ui/sortable';
import { MediaPlayer as VideoPlayer, MediaPlayerVideo, MediaPlayerControls, MediaPlayerPlay, MediaPlayerSeek, MediaPlayerVolume, MediaPlayerFullscreen } from '@/components/ui/media-player';
import { useFileUpload } from '@/hooks/use-file-upload';
import { OutlineAI, OutlineClose, OutlineDragIndicator, OutlineExport, OutlineImage, OutlineVideo } from '@/components/icons/Icons';

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
  isPremium?: boolean;
  fileSizeMbMax?: number; // default 15
  formId?: string; // external form target for a header submit button
  onValidityChange?: (valid: boolean) => void;
}

type Kind = 'image' | 'gif' | 'video';

type Item = {
  id: string;
  file: File;
  preview: string;
  alt: string;
  kind: Kind;
  // upload meta
  progress: number;           // 0..100
  status: 'idle' | 'processing' | 'uploading' | 'done' | 'error';
  error?: string;
  // generated on convert/inspect
  width?: number;
  height?: number;
  size_bytes?: number;
  mime?: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'video/webm';
  // post meta
  isCover?: boolean;
  // server results
  serverPath?: string;
  serverId?: string;
};

const MAX_ALT = 140;

/** Small helper — format bytes */
const fmt = (n: number) => {
  if (!n && n !== 0) return '';
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0, v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${u[i]}`;
};

// Probe media dimensions for images/gifs/videos using browser APIs
async function probeDimensions(file: File, kind: Kind): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    // Videos: use a <video> element to read metadata
    if (kind === 'video') {
      let url = '';
      try { url = URL.createObjectURL(file); } catch { /* noop */ }
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.onloadedmetadata = () => {
        const width = v.videoWidth || 1;
        const height = v.videoHeight || 1;
        resolve({ width, height });
        try { if (url) { URL.revokeObjectURL(url); } } catch { }
      };
      v.onerror = () => {
        resolve({ width: 1, height: 1 });
        try { if (url) { URL.revokeObjectURL(url); } } catch { }
      };
      v.src = url;
      return;
    }

    // Images/GIFs: use an Image element to read natural size
    let url = '';
    try { url = URL.createObjectURL(file); } catch { /* noop */ }
    const imgEl = new window.Image();
    imgEl.onload = () => {
      const width = imgEl.naturalWidth || 1;
      const height = imgEl.naturalHeight || 1;
      resolve({ width, height });
      try { if (url) { URL.revokeObjectURL(url); } } catch { }
    };
    imgEl.onerror = () => {
      resolve({ width: 1, height: 1 });
      try { if (url) { URL.revokeObjectURL(url); } } catch { }
    };
    imgEl.src = url;
  });
}

// Local components to safely create/revoke fresh blob URLs
function VideoBlob({ file, className, controls = false }: { file: File; className?: string; controls?: boolean }) {
  const [url, setUrl] = useState<string>('');
  useEffect(() => {
    let u = '';
    try { u = URL.createObjectURL(file); setUrl(u); } catch { /* noop */ }
    return () => { if (u) { try { URL.revokeObjectURL(u); } catch { } } };
  }, [file]);
  return <video src={url || undefined} className={className} muted playsInline preload="metadata" controls={controls} />;
}

function VideoPlayerBlob({ file, className }: { file: File; className?: string }) {
  const [url, setUrl] = useState<string>('');
  useEffect(() => {
    let u = '';
    try { u = URL.createObjectURL(file); setUrl(u); } catch { /* noop */ }
    return () => { if (u) { try { URL.revokeObjectURL(u); } catch { } } };
  }, [file]);
  return (
    <VideoPlayer className={className}>
      <MediaPlayerVideo src={url || undefined} playsInline preload="metadata" className={className} />
      <MediaPlayerControls className="pointer-events-auto">
        <div className="flex w-full items-center gap-2 px-2">
          <MediaPlayerPlay />
          <MediaPlayerSeek withTime className="flex-1" />
          <MediaPlayerVolume expandable />
          <MediaPlayerFullscreen />
        </div>
      </MediaPlayerControls>
    </VideoPlayer>
  );
}

export function CreateMediaPost({
  onPostCreated,
  isPremium: isPremiumProp,
  fileSizeMbMax = 15,
  formId,
}: CreatePostProps) {
  const { user, profile } = useAuth();

  // Use profile.is_premium from database instead of user_metadata
  const isPremium = isPremiumProp ?? Boolean(profile?.is_premium);

  // Debug log to see what's in profile
  console.log('Profile:', profile);
  console.log('Profile is_premium:', profile?.is_premium);
  console.log('Final isPremium:', isPremium);
  console.log('Profile loading state:', profile === null ? 'null' : 'loaded');

  const MAX_IMAGES = isPremium ? 10 : 5;
  const MAX_VIDEOS = 1;
  const MAX_CHARS = isPremium ? 1000 : 300;
  // Premium users get 50MB, free users get 15MB
  const actualFileSizeMbMax = isPremium ? 50 : (fileSizeMbMax || 15);
  const FILE_MAX = actualFileSizeMbMax * 1024 * 1024; // bytes

  const [caption, setCaption] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const [overDrop, setOverDrop] = useState(false);

  // wire: useFileUpload (paste/drag/drop/browse)
  const [, uploadActions] = useFileUpload({
    accept: 'image/*,video/*',
    multiple: true,
    maxFiles: MAX_IMAGES + MAX_VIDEOS,
    maxSize: FILE_MAX,
    onFilesAdded: (added) => {
      const toAdd: Item[] = [];
      let videoCount = items.filter(i => i.kind === 'video').length;

      for (const f of added) {
        const file = f.file as File;
        const isVideo = file.type?.startsWith('video/');
        const isGif = file.type === 'image/gif';
        const kind: Kind = isVideo ? 'video' : (isGif ? 'gif' : 'image');

        // enforce counts
        if (kind === 'video') {
          if (videoCount >= MAX_VIDEOS) continue;
          videoCount++;
        } else {
          const imgCount = toAdd.filter(t => t.kind !== 'video').length + items.filter(i => i.kind !== 'video').length;
          if (imgCount >= MAX_IMAGES) continue;
        }

        // size guard (already validated by hook, but double-check)
        if (FILE_MAX !== Infinity && file.size > FILE_MAX) continue;

        toAdd.push({
          id: f.id,
          file,
          preview: f.preview || URL.createObjectURL(file),
          alt: '',
          kind,
          progress: 0,
          status: 'idle',
        });
      }

      if (toAdd.length) {
        const next = [...items, ...toAdd];
        setItems(next);
        setErr(null);
        if (!selectedId) setSelectedId(toAdd[0].id);
      }
    },
  });

  // derived counts
  const countImages = items.filter(i => i.kind !== 'video').length;
  const countVideos = items.filter(i => i.kind === 'video').length;

  // schema (text optional, at least 1 media)
  const payloadSchema = useMemo(() => z.object({
    content: z.string().trim().max(MAX_CHARS, 'Too long').optional(),
    images: z.array(z.object({ url: z.string().min(1) })).min(1, 'At least one media'),
  }), [MAX_CHARS]);

  const [uploading, setUploading] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);
  type Meta = { id: string; path: string; alt: string; width: number; height: number; size_bytes: number; mime: NonNullable<Item['mime']>; is_cover: boolean };
  const [uploadedMetas, setUploadedMetas] = useState<Meta[]>([]);
  type UploadResp = { path?: string; mime?: NonNullable<Item['mime']> };

  const canSubmit = useMemo(() => {
    const res = payloadSchema.safeParse({
      content: caption.trim() || undefined,
      images: items.map(i => ({ url: i.preview })),
    });
    const allDone = items.every(i => i.status === 'done');
    return res.success && !posting && !uploading && allDone && items.length > 0;
  }, [caption, items, posting, uploading, payloadSchema]);

  // paste support
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const onPaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const files = Array.from(e.clipboardData.files || []);
      if (files.length > 0) {
        e.preventDefault();
        uploadActions.addFiles(files);
      }
    };
    el.addEventListener('paste', onPaste);
    return () => el.removeEventListener('paste', onPaste);
  }, [uploadActions]);

  // cleanup previews on unmount
  useEffect(() => () => items.forEach(i => {
    if (i.preview && i.preview.startsWith('blob:')) URL.revokeObjectURL(i.preview);
  }), [items]);

  // selection helpers
  const selected = items.find(i => i.id === selectedId) || null;
  const setSelected = (id: string) => setSelectedId(id);

  // remove
  const removeById = useCallback((id: string) => {
    setItems(prev => {
      const rem = prev.find(p => p.id === id);
      if (rem?.preview && rem.preview.startsWith('blob:')) URL.revokeObjectURL(rem.preview);
      try { uploadActions.removeFile(id); } catch { }
      const next = prev.filter(p => p.id !== id);
      if (selectedId === id) setSelectedId(next[0]?.id ?? null);
      return next;
    });
  }, [selectedId, uploadActions]);

  const clearAll = useCallback(() => {
    items.forEach(i => i.preview && i.preview.startsWith('blob:') && URL.revokeObjectURL(i.preview));
    setItems([]);
    uploadActions.clearFiles();
    setSelectedId(null);
    setUploadedMetas([]);
    setPostId(null);
  }, [items, uploadActions]);

  // overall progress (only uploading items count)
  const overallProgress = useMemo(() => {
    const ups = items.filter(i => i.status === 'processing' || i.status === 'uploading');
    if (ups.length === 0) return 0;
    const sum = ups.reduce((a, b) => a + (b.progress || 0), 0);
    return Math.round(sum / ups.length);
  }, [items]);

  // ---------- upload core ----------------------------------------------------

  const uploadOne = useCallback(async (it: Item, postId: string, onProgress: (pct: number) => void) => {
    // no client-side conversion; backend converts to webp/webm
    const blob: Blob = it.file;
    let ext = (it.file.name.split('.').pop() || 'bin').toLowerCase();
    let mime = it.file.type || 'application/octet-stream';

    console.debug('[uploadOne] start', { kind: it.kind, size: it.file.size, type: it.file.type, name: it.file.name });

    // dims bedzie liczony po stronie serwera

    // Probe dims on client for all kinds (image/gif/video). Server may also verify.
    let probeW = 0, probeH = 0;
    try {
      const dim = await probeDimensions(it.file, it.kind);
      probeW = dim.width || 0;
      probeH = dim.height || 0;
    } catch { /* noop */ }

    const imageId = randomUUIDv7();
    const key = `posts/${postId}/${imageId}.${ext}`;
    console.debug('[uploadOne] prepared id', { key, mime, size: blob.size });

    const MEDIA_API = process.env.NEXT_PUBLIC_BACKEND || process.env.NEXT_PUBLIC_MEDIA_API_URL || 'https://api.rabbittale.co';

    // Direct upload for videos or payloads that may exceed serverless limits
    if (it.kind === 'video' || blob.size > 4 * 1024 * 1024) {
      let serverMeta: Meta | null = null;
      await new Promise<void>(async (resolve, reject) => {
        try {
          const fd = new FormData();
          fd.append('file', blob, `${imageId}.${ext}`);
          fd.append('postId', postId);
          fd.append('userId', user?.id || '');
          fd.append('kind', it.kind);
          fd.append('isCover', String(Boolean(it.isCover)));
          fd.append('alt', it.alt || '');
          if (probeW && probeH) {
            fd.append('width', String(probeW));
            fd.append('height', String(probeH));
          }
          onProgress(1);
          const res = await fetch(`${MEDIA_API}/social/v1/post/upload`, { method: 'POST', body: fd });
          if (!res.ok) {
            const t = await res.text().catch(() => '');
            console.error('[uploadOne] server upload failed', res.status, t);
            reject(new Error('server_upload_failed'));
            return;
          }
          const json: UploadResp = await res.json();
          serverMeta = {
            id: imageId,
            path: json.path || key,
            alt: it.alt || '',
            width: probeW || 1,
            height: probeH || 1,
            size_bytes: Number(blob.size || 1),
            mime: (json.mime || 'video/webm') as NonNullable<Item['mime']>,
            is_cover: Boolean(it.isCover),
          } as Meta;
          try { patchItem(it.id, { width: serverMeta.width, height: serverMeta.height, serverPath: serverMeta.path, serverId: serverMeta.id }); } catch { }
          resolve();
        } catch (e) { reject(e); }
      });
      return (serverMeta as unknown) as {
        id: string; path: string; alt: string; width: number; height: number; size_bytes: number; mime: NonNullable<Item['mime']>; is_cover: boolean
      };
    }

    // Upload to our server endpoint which converts (sharp/ffmpeg) and pushes to storage
    let serverMeta: Meta | null = null;
    await new Promise<void>(async (resolve, reject) => {
      try {
        const fd = new FormData();
        fd.append('file', blob, `${imageId}.${ext}`);
        fd.append('postId', postId);
        fd.append('userId', user?.id || '');
        fd.append('kind', it.kind);
        fd.append('isCover', String(Boolean(it.isCover)));
        fd.append('alt', it.alt || '');
        if (probeW && probeH) {
          fd.append('width', String(probeW));
          fd.append('height', String(probeH));
        }
        onProgress(1);
        const res = await fetch(`${MEDIA_API}/social/v1/post/upload`, { method: 'POST', body: fd });
        if (!res.ok) {
          const t = await res.text().catch(() => '');
          console.error('[uploadOne] server upload failed', res.status, t);
          reject(new Error('server_upload_failed'));
          return;
        }
        const json: UploadResp = await res.json();
        const built = {
          id: imageId,
          path: json.path || key,
          alt: it.alt || '',
          width: probeW || 1,
          height: probeH || 1,
          size_bytes: Number(blob.size || 1),
          mime: (json.mime || (it.kind === 'gif' || it.kind === 'video' ? 'video/webm' : 'image/webp')) as NonNullable<Item['mime']>,
          is_cover: Boolean(it.isCover),
        } as Meta;
        ext = (built.path?.split('.').pop() || ext);
        mime = built.mime || mime;
        serverMeta = built;
        try { patchItem(it.id, { width: built.width, height: built.height, serverPath: built.path, serverId: built.id }); } catch { }
        resolve();
      } catch (e) {
        reject(e);
      }
    });

    const fallback = {
      id: imageId,
      path: key,
      alt: it.alt || '',
      width: 1,
      height: 1,
      size_bytes: Number(blob.size || 1),
      mime: mime as NonNullable<Item['mime']>,
      is_cover: Boolean(it.isCover),
    } as const;
    const meta = serverMeta ?? fallback;
    return meta;
  }, [user?.id]);

  // run uploads with small concurrency
  const uploadAll = useCallback(async (_items: Item[], postId: string, setOne: (id: string, patch: Partial<Item>) => void) => {
    const metas: Meta[] = [];
    const queue = [..._items];

    const workers = 3; // concurrency
    async function worker() {
      while (queue.length) {
        const it = queue.shift()!;
        setOne(it.id, { status: 'processing', progress: 1, error: undefined });

        try {
          const meta = await uploadOne(it, postId, (p) => setOne(it.id, { status: 'uploading', progress: p }));
          metas.push(meta);
          setOne(it.id, { status: 'done', progress: 100, mime: meta.mime, width: meta.width, height: meta.height, size_bytes: meta.size_bytes });
        } catch (e: unknown) {
          setOne(it.id, { status: 'error', error: e instanceof Error ? e.message : 'Upload failed' });
          throw e;
        }
      }
    }

    const runners = Array.from({ length: Math.min(workers, queue.length) }, () => worker());
    await Promise.all(runners);
    return metas;
  }, [uploadOne]);

  // auto-upload newly added items in background and collect metas
  useEffect(() => {
    const idle = items.filter(i => i.status === 'idle');
    if (idle.length === 0 || uploading) return;
    const ensurePost = postId ?? randomUUIDv7();
    if (!postId) setPostId(ensurePost);
    setUploading(true);
    (async () => {
      try {
        const metas = await uploadAll(idle, ensurePost, patchItem);
        setUploadedMetas(prev => {
          const existing = new Set(prev.map(m => m.id));
          const added = metas.filter(m => !existing.has(m.id));
          return [...prev, ...added];
        });
      } catch {
        // errors handled per item
      } finally {
        setUploading(false);
      }
    })();
  }, [items, postId, uploading, uploadAll]);

  const patchItem = (id: string, patch: Partial<Item>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  };

  // ---------- submit ---------------------------------------------------------

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canSubmit || items.length === 0) return;

    setPosting(true);
    setErr(null);

    const optimistic: OptimisticPost = {
      content: caption.trim() || undefined,
      images: items.map(i => ({ url: i.preview })),
      user_id: user.id,
    };

    try {
      const ensuredPostId = postId ?? randomUUIDv7();
      if (!postId) setPostId(ensuredPostId);
      // optimistic immediately
      onPostCreated(optimistic);

      // ensure we have metas for all items (should already be uploaded)
      let metas = uploadedMetas;
      if (metas.length !== items.length) {
        const pending = items.filter(i => i.status !== 'done');
        if (pending.length) {
          const extra = await uploadAll(pending, ensuredPostId, patchItem);
          metas = [...uploadedMetas, ...extra];
          setUploadedMetas(metas);
        }
      }

      // create post (server API builds public URLs from storage paths)
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          text: optimistic.content,
          images: metas.map(m => ({
            id: m.id,
            path: m.path,
            alt: (items.find(i => i.serverId === m.id)?.alt || m.alt || ''),
            width: Math.max(1, m.width || 1),
            height: Math.max(1, m.height || 1),
            size_bytes: m.size_bytes,
            mime: m.mime,
            is_cover: m.is_cover,
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create post');
      }
      const realPost = await res.json();
      onPostCreated(optimistic, realPost);

      // reset
      setCaption('');
      clearAll();
    } catch (e: unknown) {
      onPostCreated(optimistic, undefined, true);
      setErr(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setPosting(false);
    }
  };

  if (!user) return null;

  // ---------- UI -------------------------------------------------------------

  return (
    <form
      id={formId}
      ref={formRef}
      onSubmit={onSubmit}
      className="rounded-2xl bg-white ring-1 ring-border backdrop-blur-sm"
    >
      {/* Top: Caption + limits */}
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <OutlineAI className='size-[1.5em]' />
            <span className="truncate">{isPremium ? 'Premium' : 'Free plan'} • up to {MAX_IMAGES} images, 1 video, {MAX_CHARS} chars, {actualFileSizeMbMax}MB files</span>
            {profile === null && <span className="text-orange-500">(Loading profile...)</span>}
          </div>
          <div className="text-[11px] text-muted-foreground">{caption.trim().length}/{MAX_CHARS}</div>
        </div>

        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value.slice(0, MAX_CHARS))}
          placeholder="I'm working on…"
          className="min-h-[84px] shadow-none p-3 resize-none border-0 bg-transparent focus-visible:ring-0 text-[15px] leading-6"
          disabled={posting}
        />
      </div>

      {/* Media area */}
      <div className="border-t px-3 pb-3">
        {/* hidden file input (always mounted so Add works) */}
        <input {...uploadActions.getInputProps({ accept: 'image/*,video/*', multiple: true })} className="hidden" />
        {/* Dropzone when empty */}
        {items.length === 0 ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setOverDrop(true); }}
            onDragLeave={() => setOverDrop(false)}
            onDrop={(e) => { e.preventDefault(); setOverDrop(false); uploadActions.addFiles(e.dataTransfer.files); }}
            className={[
              'rounded-xl border border-dashed p-8 transition-colors cursor-pointer bg-neutral-50 hover:bg-neutral-100 text-center',
              overDrop ? 'border-primary/50' : 'border-border'
            ].join(' ')}
            onClick={uploadActions.openFileDialog}
            role="button"
            tabIndex={0}
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background/80">
              <OutlineExport className="size-[1.5em] text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground">
              Drag & drop images or a video, paste (Ctrl/Cmd+V), or <span className="underline underline-offset-2">browse</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground/80">
              {MAX_IMAGES} images max • {MAX_VIDEOS} video max • {actualFileSizeMbMax}MB each
            </div>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between py-2">
              <div className="text-[12px] text-muted-foreground">
                {countImages}/{MAX_IMAGES} images • {countVideos}/{MAX_VIDEOS} videos
              </div>
              <div className="flex items-center gap-1.5">
                <Button type="button" size="sm" variant="ghost" className="hover:bg-neutral-200" onClick={uploadActions.openFileDialog}>
                  <OutlineExport />
                  Add
                </Button>
                <Button type="button" size="sm" variant="ghost" className="hover:bg-neutral-200" onClick={clearAll} disabled={posting || items.length === 0}>
                  Clear
                </Button>
              </div>
            </div>

            {/* Grid with Sortable + inline progress */}
            <Sortable
              value={items.map(i => i.id)}
              onValueChange={(ids) => {
                const map = new Map(items.map(it => [it.id, it]));
                setItems(ids.map(id => map.get(id)!).filter(Boolean));
              }}
              getItemValue={(id) => id}
              strategy="grid"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
            >
              {items.map((it, idx) => (
                <SortableItem key={it.id} value={it.id} className="relative group">
                  <div
                    className={[
                      'relative aspect-[4/3] rounded-lg overflow-hidden border select-none',
                      selectedId === it.id ? 'ring-2 ring-primary border-transparent' : 'border-border/60',
                      'bg-black/5'
                    ].join(' ')}
                    onClick={() => setSelected(it.id)}
                  >
                    {it.kind === 'video' ? (
                      <VideoBlob file={it.file} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <Image
                        src={it.preview}
                        alt={it.alt || `Image ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    )}

                    {/* type badge (no counter) */}
                    <div className="absolute bottom-1.5 left-1.5 text-[10px] rounded-full bg-background/80 border border-border p-1 flex items-center gap-1">
                      {it.kind === 'video' ? <OutlineVideo size={16} /> : <OutlineImage size={16} />}
                    </div>

                    <SortableItemHandle className="absolute top-1.5 left-1.5">
                      <div className="inline-flex size-6 items-center justify-center rounded-full bg-background/80
                        border border-border">
                        <OutlineDragIndicator size={16} />
                      </div>
                    </SortableItemHandle>

                    {/* remove */}
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); removeById(it.id); }}
                      className="absolute top-1.5 right-1.5 z-10 inline-flex size-6 items-center justify-center rounded-full bg-background/80 border border-border text-muted-foreground hover:text-foreground transition-opacity opacity-0 group-hover:opacity-100"
                      aria-label="Remove"
                    >
                      <OutlineClose className="size-3.5" />
                    </Button>

                    {/* per-item progress */}
                    {(it.status === 'processing' || it.status === 'uploading') && (
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20">
                        <div className="h-full bg-primary/80" style={{ width: `${it.progress}%` }} />
                      </div>
                    )}
                    {it.status === 'error' && (
                      <div className="absolute inset-0 pointer-events-none bg-red-600/30 ring-2 ring-red-600 flex items-end">
                        <div className="w-full h-1 bg-red-700" />
                      </div>
                    )}
                  </div>
                </SortableItem>
              ))}
            </Sortable>

            {/* overall progress (shows only during upload) */}
            {overallProgress > 0 && overallProgress < 100 && (
              <div className="mt-2">
                <div className="h-1 w-full bg-black/10 rounded">
                  <div className="h-1 bg-primary/80 rounded" style={{ width: `${overallProgress}%` }} />
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">Uploading… {overallProgress}%</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details panel */}
      {selected && (
        <div className="border-t p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <div className="text-xs text-muted-foreground mb-1">Selected</div>
            <div className="relative rounded-lg overflow-hidden border border-border bg-black/5 aspect-video">
              {selected.kind === 'video' ? (
                <VideoPlayerBlob file={selected.file} className="absolute inset-0 w-full h-full object-contain bg-black" />
              ) : (
                <Image src={selected.preview} alt={selected.alt || 'Selected'} fill className="object-contain bg-black" />
              )}
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                {/* <HashIcon className="h-3.5 w-3.5" /> */}
                Alt text ({MAX_ALT})
              </label>
              <input
                type="text"
                value={selected.alt}
                onChange={(e) => patchItem(selected.id, { alt: e.target.value.slice(0, MAX_ALT) })}
                placeholder="Describe this media"
                className="w-full rounded-md bg-white text-[13px] px-2.5 py-2 outline-none ring-1 ring-inset ring-border focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[12px] text-muted-foreground">
              <div className="rounded-md ring-1 ring-border p-2">
                <div className="text-[10px] uppercase">Type</div>
                <div className="text-foreground">{selected.kind}</div>
              </div>
              <div className="rounded-md ring-1 ring-border p-2">
                <div className="text-[10px] uppercase">Size</div>
                <div className="text-foreground">{fmt(selected.file.size)}</div>
              </div>
              <div className="rounded-md ring-1 ring-border p-2">
                <div className="text-[10px] uppercase">Dims</div>
                <div className="text-foreground">
                  {selected.width && selected.height ? `${selected.width}×${selected.height}` : '—'}
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="w-full hover:bg-neutral-200"
              onClick={() => removeById(selected.id)}
            >
              <OutlineClose />
              Remove media
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t px-3 py-2 flex items-center justify-between">
        <div className="text-[11px] text-muted-foreground">
          Paste (Ctrl/Cmd+V) • Reorder (drag handle) • Delete (select → Remove)
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            size="sm"
            className="px-4"
            disabled={!canSubmit || posting}
          >
            {posting ? 'Posting…' : 'Post'}
          </Button>
        </div>
      </div>

      {/* Error */}
      {err && (
        <div className="px-3 pb-3">
          <div className="text-[12px] text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
            {err}
          </div>
        </div>
      )}
    </form>
  );
}

// Backward-compatible export for existing imports
export { CreateMediaPost as CreatePost };
