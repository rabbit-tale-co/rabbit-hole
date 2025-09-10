import type {
	InternalUser,
	InternalUserListItem,
	User,
	UserListItem,
} from "@/types/user";

/**
 * Sanitizes a user object by removing sensitive fields
 */
export function sanitizeUser(user: InternalUser): User {
	return {
		user_id: user.user_id,
		username: user.username,
		display_name: user.display_name,
		bio: user.bio,
		avatar_url: user.avatar_url,
		cover_url: user.cover_url,
		accent_color: user.accent_color,
		is_premium: user.is_premium,
		followStats: user.followStats,
	};
}

/**
 * Sanitizes a user list item by removing sensitive fields
 */
export function sanitizeUserListItem(user: InternalUserListItem): UserListItem {
	return {
		user_id: user.user_id,
		username: user.username,
		display_name: user.display_name,
		bio: user.bio,
		avatar_url: user.avatar_url,
		cover_url: user.cover_url,
		accent_color: user.accent_color,
		is_premium: user.is_premium ?? false,
		followStats: user.followStats,
	};
}

/**
 * Sanitizes an array of users
 */
export function sanitizeUsers(users: InternalUser[]): User[] {
	return users.map(sanitizeUser);
}

/**
 * Sanitizes an array of user list items
 */
export function sanitizeUserListItems(
	users: InternalUserListItem[],
): UserListItem[] {
	return users.map(sanitizeUserListItem);
}

/**
 * Sanitizes a user response object (for API responses)
 */
export function sanitizeUserResponse(response: { profile: InternalUser }): {
	profile: User;
} {
	return {
		profile: sanitizeUser(response.profile),
	};
}

/**
 * Sanitizes a users list response object (for API responses)
 */
export function sanitizeUsersListResponse(response: {
	items: InternalUserListItem[];
	nextCursor: string | null;
}): {
	items: UserListItem[];
	nextCursor: string | null;
} {
	return {
		items: sanitizeUserListItems(response.items),
		nextCursor: response.nextCursor,
	};
}
