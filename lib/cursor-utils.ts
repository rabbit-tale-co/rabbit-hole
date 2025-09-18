/**
 * Cursor utilities for pagination
 * Provides functions to encode and decode cursor-based pagination tokens
 */

/**
 * Decode a cursor string to get timestamp and ID
 * @param cursor - Base64 encoded cursor string in format "timestamp|id"
 * @returns Object with timestamp and ID, or null if invalid
 */
export function decodeCursor(cursor?: string | null) {
	if (!cursor) return null;
	try {
		const [ts, id] = Buffer.from(cursor, "base64").toString("utf8").split("|");
		return { ts, id };
	} catch {
		return null;
	}
}

/**
 * Encode timestamp and ID into a cursor string
 * @param ts - Timestamp string
 * @param id - ID string
 * @returns Base64 encoded cursor string
 */
export function encodeCursor(ts: string, id: string) {
	return Buffer.from(`${ts}|${id}`).toString("base64");
}
