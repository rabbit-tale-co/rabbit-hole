"use client";

import { useManualImpression } from "@/hooks/useManualImpression";
import { useEffect, useRef } from "react";

interface PostImpressionTrackerProps {
	postId: string;
}

export function PostImpressionTracker({ postId }: PostImpressionTrackerProps) {
	const { recordImpression } = useManualImpression({
		minGapSeconds: 30,
		enabled: false,
	});
	const hasRecordedRef = useRef(false);

	useEffect(() => {
		if (!postId || hasRecordedRef.current) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !hasRecordedRef.current) {
					// Add small delay to ensure post is actually visible
					setTimeout(() => {
						recordImpression(postId);
						hasRecordedRef.current = true;
					}, 500);
				}
			},
			{
				threshold: 0.5, // Post must be 50% visible
				rootMargin: "0px",
			},
		);

		// Observe element with postId (we can use data-post-id)
		const postElement = document.querySelector(`[data-post-id="${postId}"]`);
		if (postElement) {
			observer.observe(postElement);
		}

		return () => {
			observer.disconnect();
		};
	}, [postId, recordImpression]);

	return null;
}
