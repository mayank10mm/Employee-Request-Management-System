import { NextResponse } from "next/server";
import { Department, Priority, RequestStatus } from "@prisma/client";
import { RequestError } from "@/lib/request-service";

export function jsonError(error: unknown) {
  if (error instanceof RequestError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error(error);
  return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
}

export function parsePriority(value: unknown): Priority {
  if (typeof value !== "string") {
    throw new RequestError(400, "Priority is required.");
  }

  const normalized = value.toUpperCase();
  if (!isPriority(normalized)) {
    throw new RequestError(400, "Priority must be LOW, MEDIUM, HIGH, or CRITICAL.");
  }

  return normalized;
}

export function parseStatus(value: unknown): RequestStatus {
  if (typeof value !== "string") {
    throw new RequestError(400, "Status is required.");
  }

  const normalized = value.toUpperCase();
  if (!isStatus(normalized)) {
    throw new RequestError(400, "Status must be OPEN, ACTIVE, or FINALIZED.");
  }

  return normalized;
}

export function parseOptionalStatus(value: string | null): RequestStatus | undefined {
  if (!value) {
    return undefined;
  }
  return parseStatus(value);
}

export function parseOptionalDepartment(
  value: string | null,
): Department | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.toUpperCase();
  if (!isDepartment(normalized)) {
    throw new RequestError(
      400,
      "Department must be HR, IT, PAYROLL, OPERATIONS, or OTHER.",
    );
  }

  return normalized;
}

function isPriority(value: string): value is Priority {
  return ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(value);
}

function isStatus(value: string): value is RequestStatus {
  return ["OPEN", "ACTIVE", "FINALIZED"].includes(value);
}

function isDepartment(value: string): value is Department {
  return ["HR", "IT", "PAYROLL", "OPERATIONS", "OTHER"].includes(value);
}
