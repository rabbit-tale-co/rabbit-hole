"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ImagePlus, UploadCloud, Palette, Wand2, Sparkles, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import Center from "@/components/Center";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OutlineImage } from "@/components/icons/Icons";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * Empty gallery states for profile & home feed
 *
 * - ProfileEmptyGallery: when a user (self or other) has no posts
 * - HomeEmptyFeed: when the global/home feed is empty (new platform, niche tags, etc.)
 */

export type ProfileEmptyGalleryProps = {
  isOwnProfile?: boolean;
  message?: string;
  description?: string;
  onCreate?: () => void;
  onUpload?: (files: File[]) => void;
};

export default function ProfileEmptyGallery({
  isOwnProfile = false,
  message = "No posts yet",
  description,
  onCreate,
  onUpload,
}: ProfileEmptyGalleryProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [openComposer, setOpenComposer] = React.useState(false);

  const CreatePostDialog = React.useMemo(() => dynamic(() => import("@/components/feed/upload/create-post").then(m => m.CreatePost), { ssr: false }), []);

  const defaultDescription = isOwnProfile
    ? "Share your first piece — images, process shots or short reels."
    : "This creator hasn’t posted anything yet. Follow to get updates.";

  function openFileDialog() {
    fileInputRef.current?.click();
  }

  function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    onUpload?.(Array.from(files));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="mx-auto mt-10 max-w-6xl px-3 pb-20">
      <Card className="relative overflow-hidden p-0 shadow-none">
        <CardContent className="p-0">
          {/* Hero / Header */}
          <div className="relative grid gap-6 p-6 sm:p-10 lg:grid-cols-[1.2fr_.8fr]">
            <div className="flex flex-col items-center justify-center text-center lg:items-start lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Make your first impression count
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                {message}
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="mt-2 max-w-xl text-sm text-muted-foreground"
              >
                {description || defaultDescription}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="mt-5 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
              >
                {isOwnProfile ? (
                  <>
                    <Button onClick={onCreate ? onCreate : () => setOpenComposer(true)} className="gap-2">
                      <Wand2 className="h-4 w-4" /> Create post
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files)}
                    />
                  </>
                ) : (
                  <Button variant="secondary" asChild>
                    <a href="/explore" className="gap-2">
                      <Palette className="h-4 w-4" /> Explore creators
                    </a>
                  </Button>
                )}
              </motion.div>
            </div>

            {/* Dropzone / Illustration */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className={
                  "group relative flex h-52 w-full items-center justify-center rounded-2xl border-2 border-dashed bg-muted/40 p-3 text-center" +
                  (isOwnProfile
                    ? " focus-within:ring-2 focus-within:ring-ring"
                    : " opacity-90")
                }
                onDragOver={(e) => {
                  if (!isOwnProfile) return;
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                role={isOwnProfile ? "button" : undefined}
                tabIndex={isOwnProfile ? 0 : -1}
                onKeyDown={(e) => {
                  if (!isOwnProfile) return;
                  if (e.key === "Enter" || e.key === " ") openFileDialog();
                }}
                aria-label={
                  isOwnProfile
                    ? "Upload or drop files to start your gallery"
                    : "Empty gallery"
                }
              >
                <div
                  className={
                    "pointer-events-none absolute inset-0 rounded-2xl transition-colors" +
                    (isDragging ? " bg-primary/10" : "")
                  }
                />
                <div className="relative z-10 flex flex-col items-center">
                  <OutlineImage />
                  <div className="mt-2 text-xs text-muted-foreground">
                    {isOwnProfile ? (
                      <>
                        Drop files here or <span className="font-medium">browse</span>
                      </>
                    ) : (
                      <>Gallery will appear here</>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Decorative floating badges */}
              <motion.div
                className="pointer-events-none absolute -left-2 -top-3 hidden gap-2 sm:flex"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Badge icon={<Camera className="h-3 w-3" />} label="WIP shots" />
                <Badge icon={<Wand2 className="h-3 w-3" />} label="Timelapse" />
              </motion.div>
            </div>
          </div>

          <Separator />

          {/* Creator tips */}
          <div className="p-3">
            <div className="grid gap-3 md:grid-cols-3">
              <Tip
                title="Show your process"
                desc="Upload sketches or progress shots — people love seeing how art evolves."
                icon={<ImagePlus className="h-4 w-4" />}
              />
              <Tip
                title="Describe the piece"
                desc="Add tools, brushes & goods. Good metadata helps discovery."
                icon={<Palette className="h-4 w-4" />}
              />
              <Tip
                title="Post consistently"
                desc="Small, regular updates build audience faster than rare big drops."
                icon={<Sparkles className="h-4 w-4" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={isOwnProfile && openComposer} onOpenChange={setOpenComposer}>
        <DialogContent className="p-0 sm:max-w-[640px] rounded-3xl overflow-hidden bg-background">
          <DialogHeader className="px-5 pt-5 pb-3">
            <DialogTitle className="text-base">Create a post</DialogTitle>
          </DialogHeader>
          <div className="px-5 pb-5">
            <CreatePostDialog onPostCreated={() => setOpenComposer(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function HomeEmptyFeed() {
  return (
    <Center>
      <div className="mx-auto max-w-4xl px-3 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="mb-6 rounded-full bg-muted/50">
            <Palette className="size-16 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Nothing here yet
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Follow artists, explore trending tags, or create your first post to
            kickstart the feed.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <a href="/explore" className="gap-2">
                <Sparkles className="h-4 w-4" /> Explore creators
              </a>
            </Button>
            <Button variant="secondary" asChild>
              <a href="/tags/trending">Discover tags</a>
            </Button>
          </div>
        </motion.div>
      </div>
    </Center>
  );
}

function Tip({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border p-3">
      <div className="mt-0.5 flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground shrink-0">
        <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      </div>
      <div>
        <p className="text-sm font-medium leading-none">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function Badge({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border bg-background/70 px-2 py-1 text-[10px] text-muted-foreground shadow-sm backdrop-blur">
      <span className="shrink-0 [&>svg]:h-3 [&>svg]:w-3">{icon}</span>
      {label}
    </div>
  );
}




// =============================
// Unified EmptyState component
// =============================
export function EmptyState({
  variant,
  isOwnProfile,
  message,
  description,
  onCreate,
  onUpload,
}: {
  variant: "profile" | "home";
  isOwnProfile?: boolean;
  message?: string;
  description?: string;
  onCreate?: () => void;
  onUpload?: (files: File[]) => void;
}) {
  if (variant === "home") {
    return <HomeEmptyFeed />;
  }
  return (
    <ProfileEmptyGallery
      isOwnProfile={isOwnProfile}
      message={message}
      description={description}
      onCreate={onCreate}
      onUpload={onUpload}
    />
  );
}
