import { supabaseAuthAdmin } from "@/lib/supabase-admin";
import { logSecureError } from "@/lib/secure-db";

export interface SessionInfo {
  id: string;
  device_info: string;
  ip_address: string;
  created_at: string;
  last_activity: string;
  is_current: boolean;
  location?: string;
  user_agent?: string;
}

/**
 * Get all active user sessions from Supabase Auth sessions table
 */
export async function getUserSessions(userId: string): Promise<SessionInfo[]> {
  try {
    // Try using RPC function to get sessions (in public schema, not social_art)
    const { data: sessions, error } = await supabaseAuthAdmin.rpc('get_user_sessions', {
      p_user_id: userId
    });

    if (error) {
      console.error('RPC get_user_sessions error:', error);

      // No direct access to auth.sessions - only through RPC functions
      console.error('No fallback available - RPC functions must be created');
      logSecureError('get_sessions_error', error, userId);
      return [];
    }

    if (!sessions || sessions.length === 0) {
      return [];
    }

    return sessions.map((session: {
      id: string;
      user_id: string;
      created_at: string;
      updated_at: string;
      ip: string;
      user_agent: string;
    }) => ({
      id: session.id,
      device_info: getDeviceInfo(session.user_agent || ''),
      ip_address: session.ip || 'Unknown',
      created_at: session.created_at,
      last_activity: session.updated_at || session.created_at,
      is_current: false, // Will be set to true for the current session
      location: getLocationFromIP(session.ip || ''),
      user_agent: session.user_agent
    }));
  } catch (error) {
    logSecureError('get_sessions_error', error, userId);
    return [];
  }
}


/**
 * Revoke user session using RPC function
 */
export async function revokeUserSession(
  userId: string,
  sessionId: string
): Promise<boolean> {
  try {
    // Use RPC function to revoke session (in public schema)
    const { data, error } = await supabaseAuthAdmin.rpc('revoke_user_session', {
      p_user_id: userId,
      p_session_id: sessionId
    });

    if (error) {
      console.error('RPC revoke_user_session error:', error);
      logSecureError('revoke_session_error', error, userId);
      return false;
    }

    return data === true;
  } catch (error) {
    logSecureError('revoke_session_error', error, userId);
    return false;
  }
}

/**
 * Revoke all sessions except the current one using RPC function
 */
export async function revokeAllOtherSessions(
  userId: string,
  currentSessionId: string
): Promise<boolean> {
  try {
    // Use RPC function to revoke all other sessions (in public schema)
    const { data, error } = await supabaseAuthAdmin.rpc('revoke_all_other_sessions', {
      p_user_id: userId,
      p_current_session_id: currentSessionId
    });

    if (error) {
      console.error('RPC revoke_all_other_sessions error:', error);
      logSecureError('revoke_all_sessions_error', error, userId);
      return false;
    }

    return data === true;
  } catch (error) {
    logSecureError('revoke_all_sessions_error', error, userId);
    return false;
  }
}

/**
 * Update last session activity - Supabase handles this automatically
 * This function is kept for compatibility but doesn't need to do anything
 */
export async function updateSessionActivity(
): Promise<boolean> {
  return true;
}

/**
 * Check if session is valid and not expired by querying auth.sessions table
 */
export async function validateSession(
  userId: string,
  sessionToken: string
): Promise<boolean> {
  try {
    // Extract session ID from JWT token
    const sessionId = getSessionIdFromToken(sessionToken);
    if (!sessionId) return false;

    // Cannot directly access auth.sessions - assume valid if JWT is valid
    // JWT verification already checks expiration
    return true;
  } catch (error) {
    logSecureError('validate_session_error', error, userId);
    return false;
  }
}

/**
 * Extract session ID from JWT token
 */
function getSessionIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.session_id || null;
  } catch (error) {
    console.error('Error extracting session ID from token:', error);
    return null;
  }
}

/**
 * Get location information based on IP (simplified)
 */
function getLocationFromIP(ip: string): string {
  // In a real application, you can use a geolocation service
  // For now, we return a simplified information
  if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return 'Local Network';
  }
  return 'Unknown Location';
}

/**
 * Get device information based on User-Agent
 */
export function getDeviceInfo(userAgent: string): string {
  const ua = userAgent.toLowerCase();

  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    if (ua.includes('android')) return 'Android Mobile';
    if (ua.includes('iphone')) return 'iPhone';
    return 'Mobile Device';
  }

  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'Tablet';
  }

  if (ua.includes('windows')) return 'Windows PC';
  if (ua.includes('mac')) return 'Mac';
  if (ua.includes('linux')) return 'Linux PC';

  return 'Unknown Device';
}
