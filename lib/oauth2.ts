import { SignJWT, jwtVerify } from 'jose'

// ── Environment-based OAuth2 client credentials ─────────────────────────
// Set these in your .env file:
//   OAUTH2_CLIENT_ID       – the client_id for OAuth2 client credentials flow
//   OAUTH2_CLIENT_SECRET   – the client_secret
//   OAUTH2_SIGNING_SECRET  – secret used to sign/verify access tokens (falls back to AUTH_SECRET)
//   OAUTH2_TOKEN_EXPIRY    – token lifetime in seconds (default 3600)

function getSigningSecret(): Uint8Array {
  const secret =
    process.env.OAUTH2_SIGNING_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('Missing OAUTH2_SIGNING_SECRET / AUTH_SECRET / NEXTAUTH_SECRET')
  }
  return new TextEncoder().encode(secret)
}

function getTokenExpiry(): number {
  const v = parseInt(process.env.OAUTH2_TOKEN_EXPIRY || '3600', 10)
  return Number.isFinite(v) && v > 0 ? v : 3600
}

/** Registered scopes and what they authorise */
const VALID_SCOPES = new Set([
  'user.password.write', // Allows changing user passwords
])

// ── Public helpers ──────────────────────────────────────────────────────

/**
 * Validate OAuth2 client credentials supplied in a token request.
 * Returns `true` when the id/secret pair matches the configured values.
 */
export function validateClientCredentials(
  clientId: string,
  clientSecret: string,
): boolean {
  const expectedId = process.env.OAUTH2_CLIENT_ID
  const expectedSecret = process.env.OAUTH2_CLIENT_SECRET
  if (!expectedId || !expectedSecret) return false
  return clientId === expectedId && clientSecret === expectedSecret
}

/**
 * Check whether every requested scope is valid.
 */
export function validateScopes(scopes: string[]): boolean {
  return scopes.length > 0 && scopes.every((s) => VALID_SCOPES.has(s))
}

/**
 * Issue a signed JWT access token for the client-credentials grant.
 */
export async function issueAccessToken(
  clientId: string,
  scopes: string[],
): Promise<{ access_token: string; token_type: string; expires_in: number; scope: string }> {
  const expiresIn = getTokenExpiry()
  const secret = getSigningSecret()

  const token = await new SignJWT({ scope: scopes.join(' '), client_id: clientId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expiresIn}s`)
    .setSubject(clientId)
    .sign(secret)

  return {
    access_token: token,
    token_type: 'Bearer',
    expires_in: expiresIn,
    scope: scopes.join(' '),
  }
}

export interface OAuth2TokenPayload {
  sub: string
  client_id: string
  scope: string
  iat: number
  exp: number
}

/**
 * Verify a Bearer access-token and return its payload.
 * Throws if the token is invalid or expired.
 */
export async function verifyAccessToken(token: string): Promise<OAuth2TokenPayload> {
  const secret = getSigningSecret()
  const { payload } = await jwtVerify(token, secret)
  return payload as unknown as OAuth2TokenPayload
}

/**
 * Check that the token carries a specific required scope.
 */
export function hasScope(payload: OAuth2TokenPayload, requiredScope: string): boolean {
  const scopes = (payload.scope || '').split(' ')
  return scopes.includes(requiredScope)
}
