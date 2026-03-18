import { auth } from "./auth";
import { verifyToken } from "./jwt";
import { NextRequest } from "next/server";

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
}

/**
 * Resolves the authenticated user from either:
 * 1. Authorization: Bearer <jwt> header (for direct API/Postman calls)
 * 2. NextAuth session cookie (for browser/frontend calls)
 */
export async function getRequestUser(request: NextRequest): Promise<AuthUser | null> {
  // 1. Bearer token (v1 API / Postman)
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const payload = await verifyToken(token);
      return { id: payload.id, email: payload.email, name: null, role: payload.role };
    } catch {
      return null;
    }
  }

  // 2. NextAuth session (browser)
  const session = await auth();
  if (session?.user) {
    return {
      id: session.user.id,
      email: session.user.email ?? null,
      name: session.user.name ?? null,
      role: session.user.role ?? "USER",
    };
  }

  return null;
}
