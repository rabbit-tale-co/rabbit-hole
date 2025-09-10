import { useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface UseManualImpressionOptions {
	minGapSeconds?: number;
	enabled?: boolean;
}

export function useManualImpression({
	minGapSeconds = 30,
	enabled = true,
}: UseManualImpressionOptions = {}) {
	const recordImpression = useCallback(
		async (postId: string) => {
			if (!enabled) {
				console.log(`Post ${postId}: Impression tracking disabled`);
				return false;
			}

			try {
				const { data: session } = await supabase.auth.getSession();

				// Generate anonKey for anonymous session
				let anonKey: string | null = null;
				if (!session.session) {
					anonKey =
						localStorage.getItem("rabbit-hole-anon-key") || crypto.randomUUID();
					if (!localStorage.getItem("rabbit-hole-anon-key")) {
						localStorage.setItem("rabbit-hole-anon-key", anonKey);
					}
				}

				const { data, error } = await supabase.rpc("record_post_view", {
					p_post_id: postId,
					p_anon_key: anonKey,
					p_min_gap_secs: minGapSeconds,
				});

				if (error) {
					console.error("Failed to record manual post impression:", {
						error: {
							message: error.message,
							code: error.code,
							details: error.details,
							hint: error.hint
						},
						postId,
						anonKey,
						hasSession: !!session?.session
					});
					if (
						error.message?.includes("relation") ||
						error.message?.includes("schema") ||
						error.message?.includes("function") ||
						error.code === "PGRST301"
					) {
						console.info(
							`Post ${postId}: Stats table/function not available yet, skipping manual impression`,
						);
					}
					return false;
				}

				if (data && data[0]) {
					const result = data[0] as {
						inserted: boolean;
						views_total: number;
						unique_viewers: number;
					};
					if (result.inserted) {
						console.log(
							`Manual impression recorded for post ${postId}: ${result.views_total} total views, ${result.unique_viewers} unique viewers`,
						);
					}
					return result.inserted;
				}

				return false;
			} catch (error) {
				console.error("Error recording manual post impression:", error);
				return false;
			}
		},
		[minGapSeconds, enabled],
	);

	return { recordImpression };
}
