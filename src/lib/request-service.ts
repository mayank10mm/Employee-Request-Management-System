import {
  Department,
  Priority,
  Prisma,
  RequestStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assignLeastLoadedAgent, findDepartmentLead } from "@/lib/assignment";
import { categorizeRequest } from "@/lib/categorize";
import { generateRequestCode } from "@/lib/request-code";
import { remainingMs, slaDeadlines } from "@/lib/sla";

const requestInclude = {
  assignedTo: {
    select: { id: true, name: true, email: true, department: true },
  },
  history: {
    orderBy: { createdAt: "asc" as const },
    include: {
      performedBy: { select: { id: true, name: true, email: true } },
    },
  },
} satisfies Prisma.RequestInclude;

type RequestWithRelations = Prisma.RequestGetPayload<{
  include: typeof requestInclude;
}>;

export type CreateRequestInput = {
  employeeName: string;
  employeeEmail: string;
  subject: string;
  description: string;
  priority: Priority;
};

export async function createRequest(input: CreateRequestInput) {
  const employeeName = input.employeeName.trim();
  const employeeEmail = input.employeeEmail.trim().toLowerCase();
  const subject = input.subject.trim();
  const description = input.description.trim();

  if (!employeeName || !employeeEmail || !subject || !description) {
    throw new RequestError(400, "Name, email, subject, and description are required.");
  }

  const department = categorizeRequest(subject, description);
  const { slaFirstResponseAt, slaDeadline } = slaDeadlines(input.priority);
  const assignee = await assignLeastLoadedAgent(department);

  const employee = await prisma.user.findUnique({
    where: { email: employeeEmail },
  });

  let created;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const requestCode = generateRequestCode();
    try {
      created = await prisma.request.create({
        data: {
          requestCode,
          employeeName,
          employeeEmail,
          employeeId: employee?.id,
          subject,
          description,
          department,
          priority: input.priority,
          status: RequestStatus.OPEN,
          assignedToId: assignee?.id,
          slaFirstResponseAt,
          slaDeadline,
        },
      });
      break;
    } catch (error) {
      if (!isUniqueCodeError(error) || attempt === 4) {
        throw error;
      }
    }
  }

  if (!created) {
    throw new RequestError(500, "Could not generate a unique request ID.");
  }

  await prisma.requestHistory.createMany({
    data: [
      {
        requestId: created.id,
        action: "CREATED",
        detail: `Request ${created.requestCode} submitted.`,
        performedById: employee?.id,
      },
      {
        requestId: created.id,
        action: "CATEGORIZED",
        detail: `Auto-categorized as ${department}.`,
      },
      {
        requestId: created.id,
        action: "ASSIGNED",
        detail: assignee
          ? `Assigned to ${assignee.name} (${department}).`
          : `No agent available in ${department}. Left unassigned.`,
        performedById: assignee?.id,
      },
    ],
  });

  return refreshSlaAndLoad(created.requestCode);
}

export async function listRequests(filters?: {
  email?: string;
  status?: RequestStatus;
  department?: Department;
}) {
  const email = filters?.email?.trim().toLowerCase();

  const requests = await prisma.request.findMany({
    where: {
      ...(email ? { employeeEmail: email } : {}),
      status: filters?.status,
      department: filters?.department,
    },
    include: requestInclude,
    orderBy: { createdAt: "desc" },
  });

  return Promise.all(requests.map((request) => applySlaIfNeeded(request)));
}

export async function getRequestByCode(code: string) {
  const request = await prisma.request.findUnique({
    where: { requestCode: code.toUpperCase() },
    include: requestInclude,
  });

  if (!request) {
    throw new RequestError(404, "Request not found.");
  }

  return applySlaIfNeeded(request);
}

export async function updateRequestStatus(code: string, status: RequestStatus) {
  const request = await getRequestByCode(code);

  if (request.status === status) {
    return request;
  }

  assertTransition(request.status, status);

  const now = new Date();
  const updated = await prisma.request.update({
    where: { id: request.id },
    data: {
      status,
      resolvedAt: status === RequestStatus.FINALIZED ? now : null,
    },
  });

  await prisma.requestHistory.create({
    data: {
      requestId: updated.id,
      action: "STATUS_CHANGED",
      detail: `Status changed from ${request.status} to ${status}.`,
    },
  });

  return refreshSlaAndLoad(updated.requestCode);
}

export async function getDashboardStats() {
  const [total, open, active, finalized, breached, byDepartment] =
    await Promise.all([
      prisma.request.count(),
      prisma.request.count({ where: { status: RequestStatus.OPEN } }),
      prisma.request.count({ where: { status: RequestStatus.ACTIVE } }),
      prisma.request.count({ where: { status: RequestStatus.FINALIZED } }),
      prisma.request.count({
        where: { slaBreached: true, status: { not: RequestStatus.FINALIZED } },
      }),
      prisma.request.groupBy({
        by: ["department"],
        _count: { _all: true },
      }),
    ]);

  const departmentCounts = {
    HR: 0,
    IT: 0,
    PAYROLL: 0,
    OPERATIONS: 0,
    OTHER: 0,
  };

  for (const row of byDepartment) {
    departmentCounts[row.department] = row._count._all;
  }

  return {
    total,
    open,
    active,
    finalized,
    slaBreaches: breached,
    departments: departmentCounts,
  };
}

export function toRequestDto(request: RequestWithRelations) {
  const now = new Date();
  return {
    id: request.id,
    requestCode: request.requestCode,
    employeeName: request.employeeName,
    employeeEmail: request.employeeEmail,
    subject: request.subject,
    description: request.description,
    department: request.department,
    priority: request.priority,
    status: request.status,
    assignedTo: request.assignedTo,
    slaFirstResponseAt: request.slaFirstResponseAt?.toISOString() ?? null,
    slaDeadline: request.slaDeadline.toISOString(),
    slaBreached: request.slaBreached,
    escalatedTo: request.escalatedTo,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    resolvedAt: request.resolvedAt?.toISOString() ?? null,
    sla: {
      firstResponseRemainingMs: request.slaFirstResponseAt
        ? remainingMs(request.slaFirstResponseAt, now)
        : null,
      resolutionRemainingMs: remainingMs(request.slaDeadline, now),
      breached: request.slaBreached,
    },
    history: request.history.map((entry) => ({
      id: entry.id,
      action: entry.action,
      detail: entry.detail,
      createdAt: entry.createdAt.toISOString(),
      performedBy: entry.performedBy,
    })),
  };
}

export class RequestError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function assertTransition(from: RequestStatus, to: RequestStatus) {
  const allowed: Record<RequestStatus, RequestStatus[]> = {
    OPEN: [RequestStatus.ACTIVE],
    ACTIVE: [RequestStatus.FINALIZED],
    FINALIZED: [],
  };

  if (!allowed[from].includes(to)) {
    throw new RequestError(
      400,
      `Cannot move a ticket from ${from} to ${to}. Use Open → Active → Finalized.`,
    );
  }
}

async function refreshSlaAndLoad(code: string) {
  const request = await prisma.request.findUniqueOrThrow({
    where: { requestCode: code },
    include: requestInclude,
  });
  return applySlaIfNeeded(request);
}

async function applySlaIfNeeded(request: RequestWithRelations) {
  if (request.status === RequestStatus.FINALIZED) {
    return request;
  }

  const now = new Date();
  const firstResponseOverdue =
    request.status === RequestStatus.OPEN &&
    request.slaFirstResponseAt !== null &&
    now > request.slaFirstResponseAt;
  const resolutionOverdue = now > request.slaDeadline;

  if (!firstResponseOverdue && !resolutionOverdue) {
    return request;
  }

  if (request.slaBreached && request.escalatedTo) {
    return request;
  }

  const lead = await findDepartmentLead(request.department);
  const escalatedTo =
    request.escalatedTo ??
    (lead ? `${lead.name} (${lead.email})` : `${request.department} Lead`);

  await prisma.request.update({
    where: { id: request.id },
    data: {
      slaBreached: true,
      escalatedTo,
    },
  });

  if (!request.escalatedTo) {
    await prisma.requestHistory.create({
      data: {
        requestId: request.id,
        action: "ESCALATED",
        detail: firstResponseOverdue
          ? `First-response SLA breached. Escalated to ${escalatedTo}.`
          : `Resolution SLA breached. Escalated to ${escalatedTo}.`,
      },
    });
  }

  return prisma.request.findUniqueOrThrow({
    where: { id: request.id },
    include: requestInclude,
  });
}

function isUniqueCodeError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}
