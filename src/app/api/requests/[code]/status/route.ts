import { NextRequest, NextResponse } from "next/server";
import { jsonError, parseStatus } from "@/lib/http";
import { requireSessionFromRequest } from "@/lib/demo-session";
import { toRequestDto, updateRequestStatus } from "@/lib/request-service";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  try {
    requireSessionFromRequest(request, "EMPLOYER");
    const { code } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const updated = await updateRequestStatus(code, parseStatus(body.status));
    return NextResponse.json({ request: toRequestDto(updated) });
  } catch (error) {
    return jsonError(error);
  }
}
