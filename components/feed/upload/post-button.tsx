"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CreatePost } from "@/components/feed/upload/create-post"
import { cn } from "@/lib/utils"
import { toast } from "sonner"


type OptimisticPost = {
  content?: string;
  images: { url: string; metadata?: unknown }[];
  user_id: string;
};

export default function PostButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const formId = "create-post-form"

  const handlePostCreated = (
    optimisticPost: OptimisticPost,
    realPost?: unknown,
    isError?: boolean
  ) => {
    if (isError) {
      console.error('Failed to create post');
      toast.error('Failed to create post');
      return;
    }

    if (realPost) {
      console.log('Post created successfully:', realPost);
      toast.success('Post created successfully!');
      setOpen(false);
      // Trigger feed refresh event
      window.dispatchEvent(new CustomEvent('feed-refresh'));
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className={cn("rounded-full", className)}>
        New Post
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 sm:max-w-[640px] rounded-3xl overflow-hidden bg-background">
          <DialogHeader className="px-5 pt-5 pb-3 flex flex-row justify-between">
            <div>
              <DialogTitle className="text-base">Create a post</DialogTitle>
              <DialogDescription className="sr-only">Upload images or a video and write a caption</DialogDescription>
            </div>
          </DialogHeader>

          <div className="px-5 pb-5">
            <CreatePost
              onPostCreated={handlePostCreated}
              fileSizeMbMax={15}
              formId={formId}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
