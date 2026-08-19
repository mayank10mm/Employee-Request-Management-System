import { NextRequest, NextResponse } from "next/server";
import {
  DEMO_SESSION_COOKIE,
  DEMO_USERS,
  demoCookieOptions,
  encodeDemoSession,
  type DemoRole,
} from "@/lib/demo-auth";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { role?: string };
  const role = body.role?.toUpperCase();

  if (role !== "EMPLOYEE" && role !== "EMPLOYER") {
    return NextResponse.json(
      { error: "Role must be EMPLOYEE or EMPLOYER." },
      { status: 400 },
    );
  }

  const session = DEMO_USERS[role as DemoRole];
  const response = NextResponse.json({ session });
  response.cookies.set(
    DEMO_SESSION_COOKIE,
    encodeDemoSession(session),
    demoCookieOptions(),
  );
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEMO_SESSION_COOKIE, "", {
    ...demoCookieOptions(0),
  });
  return response;
}
