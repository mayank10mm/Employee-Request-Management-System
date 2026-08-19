import { NextRequest, NextResponse } from "next/server";
import {
  jsonError,
  parseOptionalDepartment,
  parseOptionalStatus,
  parsePriority,
} from "@/lib/http";
import { requireSessionFromRequest } from "@/lib/demo-session";
import {
  createRequest,
  listRequests,
  toRequestDto,
} from "@/lib/request-service";

export async function GET(request: NextRequest) {
  try {
    const session = requireSessionFromRequest(request);
    const { searchParams } = request.nextUrl;

    const emailFilter =
      session.role === "EMPLOYEE"
        ? session.email
        : (searchParams.get("email") ?? undefined);

    const items = await listRequests({
      email: emailFilter,
      status: parseOptionalStatus(searchParams.get("status")),
      department: parseOptionalDepartment(searchParams.get("department")),
    });

    return NextResponse.json({
      requests: items.map(toRequestDto),
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = requireSessionFromRequest(request);
    const body = (await request.json()) as Record<string, unknown>;

    const employeeName =
      session.role === "EMPLOYEE"
        ? session.name
        : String(body.employeeName ?? "");
    const employeeEmail =
      session.role === "EMPLOYEE"
        ? session.email
        : String(body.employeeEmail ?? "");

    const created = await createRequest({
      employeeName,
      employeeEmail,
      subject: String(body.subject ?? ""),
      description: String(body.description ?? ""),
      priority: parsePriority(body.priority),
    });

    return NextResponse.json({ request: toRequestDto(created) }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
