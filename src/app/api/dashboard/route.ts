import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { requireSessionFromRequest } from "@/lib/demo-session";
import { getDashboardStats } from "@/lib/request-service";

export async function GET(request: NextRequest) {
  try {
    requireSessionFromRequest(request, "EMPLOYER");
    return NextResponse.json(await getDashboardStats());
  } catch (error) {
    return jsonError(error);
  }
}
