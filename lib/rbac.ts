import { NextRequest, NextResponse } from "next/server";
import { getRequestUser, AuthUser } from "./api-auth";

type RBACResult = { error: NextResponse; user: null } | { error: null; user: AuthUser };

/**
 * Requires any authenticated user (USER or ADMIN).
 * Supports both Bearer JWT and NextAuth session.
 */
export async function requireAuth(request: NextRequest): Promise<RBACResult> {
  const user = await getRequestUser(request);
  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      ),
      user: null,
    };
  }
  return { error: null, user };
}

/**
 * Requires ADMIN role. Returns 401 if not authenticated, 403 if not admin.
 */
export async function requireAdmin(request: NextRequest): Promise<RBACResult> {
  const result = await requireAuth(request);
  if (result.error) return result;

  if (result.user.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { error: "Forbidden", message: "Admin access required" },
        { status: 403 }
      ),
      user: null,
    };
  }
  return result;
}
