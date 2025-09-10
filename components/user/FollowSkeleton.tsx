"use client";

import { UserAvatar } from "@/components/ui/user-avatar";

export function FollowSkeleton() {
	return (
		<li className="rounded-2xl bg-white border border-border overflow-hidden animate-pulse">
			<div className="flex items-start gap-3 p-3">
				<div className="flex-shrink-0 mt-0.5">
					<UserAvatar
						size="md"
						username="loading"
						className="rounded-full ring-1 ring-black/5"
					/>
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<div className="h-4 bg-gray-200 rounded w-24"></div>
						<div className="h-3 bg-gray-200 rounded w-3"></div>
					</div>

					<div className="h-3 bg-gray-200 rounded w-16 mt-1"></div>

					<div className="mt-1 space-y-1">
						<div className="h-3 bg-gray-200 rounded w-full"></div>
						<div className="h-3 bg-gray-200 rounded w-3/4"></div>
					</div>
				</div>

				<div className="flex-shrink-0 self-center">
					<div className="h-8 bg-gray-200 rounded-full w-20"></div>
				</div>
			</div>
		</li>
	);
}

export function FollowListSkeleton({ count = 3 }: { count?: number }) {
	return (
		<ul className="space-y-2">
			{Array.from({ length: count }).map((_, i) => (
				<FollowSkeleton key={i} />
			))}
		</ul>
	);
}
