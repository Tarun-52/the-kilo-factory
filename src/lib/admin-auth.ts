import { decode } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

/**
 * Reads the next-auth session cookie from the request,
 * decodes the JWT using next-auth/jwt (handles JWE encryption
 * and key derivation that raw jose cannot).
 *
 * Returns null if authorized, or a NextResponse error if not.
 */
export async function requireAdmin(request?: NextRequest) {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("[requireAdmin] NEXTAUTH_SECRET is not set in environment");
      return NextResponse.json(
        { error: "Server configuration error: missing secret" },
        { status: 500 }
      );
    }

    const payload = await decodeSessionToken(request);

    if (!payload?.sub) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (payload.isAdmin !== true) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    return null; // authorized
  } catch (err) {
    console.error("[requireAdmin] JWT verification failed:", err);
    return NextResponse.json(
      { error: "Authentication check failed" },
      { status: 401 }
    );
  }
}

// ---------------------------------------------------------------------------
// Shared JWT decoder — used by admin-auth, orders, profile, addresses APIs
// ---------------------------------------------------------------------------

const COOKIE_NAMES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

export async function decodeSessionToken(request?: NextRequest): Promise<Record<string, unknown> | null> {
  if (!request) return null;

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error("[decodeSessionToken] NEXTAUTH_SECRET is not set");
    return null;
  }

  // Try both secure and non-secure cookie names
  let tokenValue: string | undefined;
  for (const name of COOKIE_NAMES) {
    tokenValue = request.cookies.get(name)?.value;
    if (tokenValue) break;
  }

  // If no direct cookie, check for chunked cookies (name.0, name.1, ...)
  if (!tokenValue) {
    for (const baseName of COOKIE_NAMES) {
      const chunks: string[] = [];
      for (let i = 0; ; i++) {
        const chunkName = `${baseName}.${i}`;
        const val = request.cookies.get(chunkName)?.value;
        if (!val) break;
        chunks.push(val);
      }
      if (chunks.length > 0) {
        tokenValue = chunks.join("");
        break;
      }
    }
  }

  if (!tokenValue) return null;

  const payload = await decode({
    token: tokenValue,
    secret,
    salt: undefined,
  });

  return payload as Record<string, unknown>;
}