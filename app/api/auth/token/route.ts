export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import {
  validateClientCredentials,
  validateScopes,
  issueAccessToken,
} from '@/lib/oauth2'

/**
 * OAuth2 Token Endpoint – supports the `client_credentials` grant type.
 *
 * Client credentials can be provided via:
 *   1. HTTP Basic Auth header:  Authorization: Basic base64(client_id:client_secret)
 *   2. Body parameters:         client_id & client_secret (form-urlencoded or JSON)
 *
 * Body must contain:
 *   grant_type=client_credentials
 *   scope=user.password.write
 */
export async function POST(req: Request) {
  let grantType: string | null = null
  let clientId: string | null = null
  let clientSecret: string | null = null
  let scope: string | null = null

  // ── 1. Try HTTP Basic Auth header (RFC 6749 §2.3.1) ────────────────
  const authHeader = req.headers.get('authorization') || ''
  if (authHeader.startsWith('Basic ')) {
    try {
      const decoded = atob(authHeader.slice(6).trim())
      const colonIdx = decoded.indexOf(':')
      if (colonIdx !== -1) {
        clientId = decodeURIComponent(decoded.slice(0, colonIdx))
        clientSecret = decodeURIComponent(decoded.slice(colonIdx + 1))
      }
    } catch {
      // malformed Base64 – will fail at credential validation below
    }
  }

  // ── 2. Parse body (form-urlencoded or JSON) ─────────────────────────
  const contentType = req.headers.get('content-type') || ''

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const form = await req.formData()
    grantType = form.get('grant_type') as string | null
    // Body credentials only if not already set from Basic header
    if (!clientId) clientId = form.get('client_id') as string | null
    if (!clientSecret) clientSecret = form.get('client_secret') as string | null
    scope = form.get('scope') as string | null
  } else {
    // Fallback: accept JSON body
    const body = await req.json().catch(() => null)
    if (body) {
      grantType = body.grant_type ?? null
      if (!clientId) clientId = body.client_id ?? null
      if (!clientSecret) clientSecret = body.client_secret ?? null
      scope = body.scope ?? null
    }
  }

  // ── Default grant_type for client-credentials flow ──────────────────
  // Some OAuth2 tools only send credentials + scope and assume the grant.
  if (!grantType && clientId && clientSecret) {
    grantType = 'client_credentials'
  }

  // ── Validate grant type ─────────────────────────────────────────────
  if (grantType !== 'client_credentials') {
    return NextResponse.json(
      { error: 'unsupported_grant_type', error_description: 'Only client_credentials grant is supported' },
      { status: 400 },
    )
  }

  // ── Validate client credentials ─────────────────────────────────────
  if (!clientId || !clientSecret || !validateClientCredentials(clientId, clientSecret)) {
    return NextResponse.json(
      { error: 'invalid_client', error_description: 'Invalid client credentials' },
      { status: 401 },
    )
  }

  // ── Validate scope ──────────────────────────────────────────────────
  const scopes = scope ? scope.split(' ').filter(Boolean) : []
  if (!validateScopes(scopes)) {
    return NextResponse.json(
      { error: 'invalid_scope', error_description: 'One or more requested scopes are invalid' },
      { status: 400 },
    )
  }

  // ── Issue access token ──────────────────────────────────────────────
  const tokenResponse = await issueAccessToken(clientId, scopes)
  return NextResponse.json(tokenResponse)
}
