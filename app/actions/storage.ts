// Storage actions that call external API instead of local Supabase storage

// Remove entire post folder when a post is deleted via external API
export async function deletePostFolder(postId: string) {
	try {
		console.log(`[Storage] Sending delete request to external API for post: ${postId}`);

		const formData = new FormData();
		formData.append('postId', postId);

		const response = await fetch(`${process.env.EXTERNAL_API_URL}/social/v1/post/delete-folder`, {
			method: 'POST',
			body: formData,
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error(`[Storage] External API error for post ${postId}:`, errorData);
			return { error: errorData.error || 'Failed to delete post folder' };
		}

		const result = await response.json();
		console.log(`[Storage] External API deleted ${result.deletedFiles} files for post: ${postId}`);

		return { ok: true, deletedFiles: result.deletedFiles };
	} catch (error) {
		console.error(`[Storage] Failed to call external API for post ${postId}:`, error);
		return { error: "Failed to delete post folder via external API" };
	}
}

// Placeholder functions for compatibility - these should be replaced with external API calls
export async function finalizeAvatar(userId: string, path: string) {
	console.log(`[Storage] Avatar finalized for user ${userId}: ${path}`);
	return { ok: true };
}

export async function finalizeCover(userId: string, path: string) {
	console.log(`[Storage] Cover finalized for user ${userId}: ${path}`);
	return { ok: true };
}

export async function removeAvatar(userId: string) {
	console.log(`[Storage] Avatar removal requested for user ${userId} - should call external API`);
	return { ok: true };
}

export async function removeCover(userId: string) {
	console.log(`[Storage] Cover removal requested for user ${userId} - should call external API`);
	return { ok: true };
}
