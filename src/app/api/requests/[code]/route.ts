import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { requireSessionFromRequest } from "@/lib/demo-session";
import { RequestError, getRequestByCode, toRequestDto } from "@/lib/request-service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  try {
    const session = requireSessionFromRequest(request);
    const { code } = await context.params;
    const item = await getRequestByCode(code);

    if (
      session.role === "EMPLOYEE" &&
      item.employeeEmail.toLowerCase() !== session.email.toLowerCase()
    ) {
      throw new RequestError(403, "You do not have access to this request.");
    }

    return NextResponse.json({ request: toRequestDto(item) });
  } catch (error) {
    return jsonError(error);
  }
}
