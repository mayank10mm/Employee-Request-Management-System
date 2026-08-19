import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import {
  DEMO_SESSION_COOKIE,
  demoCookieOptions,
  encodeDemoSession,
  parseDemoSession,
  type DemoRole,
  type DemoSession,
} from "@/lib/demo-auth";
import { RequestError } from "@/lib/request-service";

export async function getDemoSession(): Promise<DemoSession | null> {
  const store = await cookies();
  const session = parseDemoSession(store.get(DEMO_SESSION_COOKIE)?.value);
  if (!session) {
    return null;
  }

  // Refresh cookie to the canonical demo identity.
  try {
    store.set(
      DEMO_SESSION_COOKIE,
      encodeDemoSession(session),
      demoCookieOptions(),
    );
  } catch {
    // Ignore if called from a context that cannot set cookies.
  }

  return session;
}

export function getSessionFromRequest(request: NextRequest): DemoSession | null {
  return parseDemoSession(request.cookies.get(DEMO_SESSION_COOKIE)?.value);
}

export function requireSessionFromRequest(
  request: NextRequest,
  role?: DemoRole,
): DemoSession {
  const session = getSessionFromRequest(request);
  if (!session) {
    throw new RequestError(401, "Sign in required.");
  }
  if (role && session.role !== role) {
    throw new RequestError(403, "You do not have access to this action.");
  }
  return session;
}
