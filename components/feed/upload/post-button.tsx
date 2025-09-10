"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CreatePost } from "@/components/feed/upload/create-post";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useMobile";

type OptimisticPost = {
	content?: string;
	images: { url: string; metadata?: unknown }[];
	user_id: string;
};

export default function PostButton({ className }: { className?: string }) {
	const [open, setOpen] = useState(false);
	const isMobile = useIsMobile();
	const formId = "create-post-form";

	const handlePostCreated = (
		optimisticPost: OptimisticPost,
		realPost?: unknown,
		isError?: boolean,
	) => {
		if (isError) {
			console.error("Failed to create post");
			toast.error("Failed to create post");
			return;
		}

		if (realPost) {
			console.log("Post created successfully:", realPost);
			toast.success("Post created successfully!");
			setOpen(false);
			// Trigger feed refresh event
			window.dispatchEvent(new CustomEvent("feed-refresh"));
		}
	};

	const createPostComponent = (
		<CreatePost
			onPostCreated={handlePostCreated}
			fileSizeMbMax={15}
			formId={formId}
		/>
	);

	if (isMobile) {
		return (
			<Drawer open={open} onOpenChange={setOpen}>
				<DrawerTrigger asChild>
					<Button className={cn("", className)}>New Post</Button>
				</DrawerTrigger>
				<DrawerContent className="max-h-[90vh]">
					<DrawerHeader className="text-left">
						<DrawerTitle>Create a post</DrawerTitle>
					</DrawerHeader>
					<div className="px-4 pb-4 overflow-y-auto">{createPostComponent}</div>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<>
			<Button onClick={() => setOpen(true)} className={cn("", className)}>
				New Post
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="p-0 sm:max-w-[640px] rounded-3xl overflow-hidden bg-background">
					<DialogHeader className="px-5 pt-5 pb-3 flex flex-row justify-between">
						<div>
							<DialogTitle className="text-base">Create a post</DialogTitle>
							<DialogDescription className="sr-only">
								Upload images or a video and write a caption
							</DialogDescription>
						</div>
					</DialogHeader>

					<div className="px-5 pb-5">{createPostComponent}</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
