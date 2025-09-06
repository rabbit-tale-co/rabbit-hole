import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth";
import { getUserSessions, revokeUserSession, revokeAllOtherSessions, updateSessionActivity } from "@/lib/session-management";
import { logSecureError } from "@/lib/secure-db";

/**
 * GET /api/sessions - Get all active user sessions
 */
export const GET = withAuth(async (request: NextRequest, { userId, token }) => {
  try {
    // Update current session activity
    await updateSessionActivity(userId, token);

    // Get all user sessions
    const sessions = await getUserSessions(userId);

    // Get current session ID from JWT token
    const currentSessionId = getCurrentSessionIdFromToken(token);

    // Mark current session
    const sessionsWithCurrent = sessions.map(session => ({
      ...session,
      is_current: session.id === currentSessionId
    }));

    return NextResponse.json({
      sessions: sessionsWithCurrent,
      total: sessionsWithCurrent.length
    });
  } catch (error) {
    logSecureError('get_sessions_error', error, userId);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
});

/**
 * DELETE /api/sessions - Revoke user session
 */
export const DELETE = withAuth(async (request: NextRequest, { userId, token }) => {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const revokeAll = searchParams.get('revokeAll') === 'true';

    // Get current session ID from JWT token
    const currentSessionId = getCurrentSessionIdFromToken(token);

    if (revokeAll) {
      // Revoke all sessions except the current one
      const success = await revokeAllOtherSessions(userId, currentSessionId);
      if (!success) {
        return NextResponse.json({ error: "Failed to revoke sessions" }, { status: 500 });
      }

      return NextResponse.json({
        message: "All other sessions have been revoked",
        revoked: true
      });
    }

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Check if user is trying to revoke their current session
    if (sessionId === currentSessionId) {
      return NextResponse.json({
        error: "Cannot revoke current session"
      }, { status: 400 });
    }

    // Revoke specific session
    const success = await revokeUserSession(userId, sessionId);
    if (!success) {
      return NextResponse.json({
        error: "Failed to revoke session"
      }, { status: 500 });
    }

    return NextResponse.json({
      message: "Session has been revoked",
      revoked: true
    });
  } catch (error) {
    logSecureError('revoke_session_error', error, userId);
    return NextResponse.json({ error: "Failed to revoke session" }, { status: 500 });
  }
});

/**
 * Get current session ID from JWT token
 */
function getCurrentSessionIdFromToken(token: string): string {
  try {
    // Decode JWT token to get session_id claim
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log('JWT payload:', payload);
    return payload.session_id || payload.jti || '';
  } catch (error) {
    console.error('Error extracting session ID from token:', error);
    return '';
  }
}
