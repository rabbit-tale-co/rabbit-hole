import { supabaseAuthAdmin } from '@/lib/supabase-admin';

/**
 * Types for JWT claims according to Supabase documentation
 */
export interface SupabaseJWTPayload {
  iss: string; // Issuer - URL project Supabase
  exp: number; // Expiration time
  sub: string; // Subject - User ID
  role: string; // Postgres role (authenticated, anon, service_role)
  email?: string;
  phone?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  aud?: string; // Audience
  iat?: number; // Issued at
  [key: string]: unknown; // Custom claims
}

/**
 * Safe JWT verification using Supabase client
 * Verifies HS256 tokens using Supabase Auth service
 */
export async function verifySupabaseJWT(token: string): Promise<{ userId: string; claims: SupabaseJWTPayload } | null> {
  try {
    const { data: { user }, error } = await supabaseAuthAdmin.auth.getUser(token);

    if (error || !user) {
      console.error('Supabase client verification failed:', error);
      return null;
    }

    // Decode token manually to get claims
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return null;
    }

    // const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    // console.log('JWT Algorithm:', header.alg);

    // Use 'sub' from JWT payload as userId (more secure)
    // 'sub' is the subject identifier in JWT standard
    const userId = payload.sub || user.id;

    console.log('JWT verification - user.id:', user.id, 'payload.sub:', payload.sub, 'using userId:', userId);

    return {
      userId: userId,
      claims: payload as SupabaseJWTPayload
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Get custom claims from token
 */
export async function getCustomClaims(token: string): Promise<Record<string, unknown> | null> {
  const result = await verifySupabaseJWT(token);
  if (!result) return null;

  // Return custom claims (all except standard claims)
  const standardClaims = ['iss', 'exp', 'sub', 'role', 'email', 'phone', 'aud', 'iat'];
  const customClaims: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(result.claims)) {
    if (!standardClaims.includes(key)) {
      customClaims[key] = value;
    }
  }

  return customClaims;
}

/**
 * Check if user has a specific custom claim
 */
export async function hasCustomClaim(token: string, claimName: string, expectedValue?: unknown): Promise<boolean> {
  const customClaims = await getCustomClaims(token);
  if (!customClaims) return false;

  if (expectedValue !== undefined) {
    return customClaims[claimName] === expectedValue;
  }

  return customClaims.hasOwnProperty(claimName);
}

/**
 * Get email from token
 */
export async function getEmailFromToken(token: string): Promise<string | null> {
  const result = await verifySupabaseJWT(token);
  return result?.claims.email || null;
}

/**
 * Get phone from token
 */
export async function getPhoneFromToken(token: string): Promise<string | null> {
  const result = await verifySupabaseJWT(token);
  return result?.claims.phone || null;
}

/**
 * Get user metadata from token
 */
export async function getUserMetadataFromToken(token: string): Promise<Record<string, unknown> | null> {
  const result = await verifySupabaseJWT(token);
  return result?.claims.user_metadata || null;
}

/**
 * Get app metadata from token
 */
export async function getAppMetadataFromToken(token: string): Promise<Record<string, unknown> | null> {
  const result = await verifySupabaseJWT(token);
  return result?.claims.app_metadata || null;
}

/**
 * Check if token is valid (not expired and has correct structure)
 */
export async function isTokenValid(token: string): Promise<boolean> {
  const result = await verifySupabaseJWT(token);
  return result !== null;
}

/**
 * Get token expiration time
 */
export async function getTokenExpiration(token: string): Promise<Date | null> {
  const result = await verifySupabaseJWT(token);
  if (!result || !result.claims.exp) return null;

  return new Date(result.claims.exp * 1000);
}

/**
 * Check if token will expire in the given time (in seconds)
 */
export async function isTokenExpiringSoon(token: string, secondsThreshold: number = 300): Promise<boolean> {
  const expiration = await getTokenExpiration(token);
  if (!expiration) return true;

  const now = new Date();
  const timeUntilExpiration = expiration.getTime() - now.getTime();

  return timeUntilExpiration <= (secondsThreshold * 1000);
}

/**
 * Get JWT header information including algorithm
 */
export function getJWTHeader(token: string): { alg: string; typ: string; kid?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return null;
    }

    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    return {
      alg: header.alg,
      typ: header.typ,
      kid: header.kid
    };
  } catch (error) {
    console.error('Error parsing JWT header:', error);
    return null;
  }
}

/**
 * Check if JWT uses RS256 algorithm
 */
export function isRS256Token(token: string): boolean {
  const header = getJWTHeader(token);
  return header?.alg === 'RS256';
}

/**
 * Check if JWT uses HS256 algorithm
 */
export function isHS256Token(token: string): boolean {
  const header = getJWTHeader(token);
  return header?.alg === 'HS256';
}
