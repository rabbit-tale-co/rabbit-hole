"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CreatePost } from "@/components/feed/upload/create-post"
// import type { Post } from "@/types/db"


type OptimisticPost = {
  content?: string;
  images: { url: string; metadata?: unknown }[];
  user_id: string;
};

export default function PostButton() {
  const [open, setOpen] = useState(false)
  const formId = "create-post-form"
  const [canSubmit, setCanSubmit] = useState(false)

  const handlePostCreated = (
    optimisticPost: OptimisticPost,
    realPost?: unknown,
    isError?: boolean
  ) => {
    if (isError) {
      console.error('Failed to create post');
      return;
    }

    if (realPost) {
      console.log('Post created successfully:', realPost);
      setOpen(false);
      // Optionally refresh the page or update UI
      window.location.reload();
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="rounded-full">
        New Post
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 sm:max-w-[640px] rounded-3xl overflow-hidden bg-background">
          <DialogHeader className="px-5 pt-5 pb-3 flex flex-row justify-between">
            <DialogTitle className="text-base">Create a post</DialogTitle>
            <Button
              type="submit"
              form={formId}
              size="sm"
              className="h-8 px-3 rounded-full"
              disabled={!canSubmit}
            >
              Post
            </Button>

          </DialogHeader>

          <div className="px-5 pb-5">
            <CreatePost
              onPostCreated={handlePostCreated}
              fileSizeMbMax={15}
              formId={formId}
              onValidityChange={setCanSubmit}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
