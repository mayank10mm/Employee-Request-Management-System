export type DemoRole = "EMPLOYEE" | "EMPLOYER";

export type DemoSession = {
  role: DemoRole;
  name: string;
  email: string;
};

export const DEMO_SESSION_COOKIE = "ers_demo_session";

export const DEMO_USERS: Record<DemoRole, DemoSession> = {
  EMPLOYEE: {
    role: "EMPLOYEE",
    name: "Demo Employee",
    email: "employee@company.com",
  },
  EMPLOYER: {
    role: "EMPLOYER",
    name: "Employer Admin",
    email: "employer@company.com",
  },
};

export function parseDemoSession(raw: string | undefined | null): DemoSession | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DemoSession>;
    if (parsed.role === "EMPLOYEE" || parsed.role === "EMPLOYER") {
      // Always use canonical demo identity so old cookies (abc@gmail.com) stay updated.
      return DEMO_USERS[parsed.role];
    }
  } catch {
    return null;
  }

  return null;
}

export function encodeDemoSession(session: DemoSession) {
  return JSON.stringify(session);
}

export function demoCookieOptions(maxAge = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
    secure: process.env.NODE_ENV === "production",
  };
}
