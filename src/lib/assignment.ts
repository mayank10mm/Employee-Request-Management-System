import { Department, RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function assignLeastLoadedAgent(department: Department) {
  const agents = await prisma.user.findMany({
    where: { role: "AGENT", department },
    include: {
      _count: {
        select: {
          assignedRequests: { where: { status: RequestStatus.ACTIVE } },
        },
      },
    },
  });

  if (agents.length === 0) {
    return null;
  }

  agents.sort(
    (a, b) =>
      a._count.assignedRequests - b._count.assignedRequests ||
      a.name.localeCompare(b.name),
  );

  return agents[0];
}

export async function findDepartmentLead(department: Department) {
  return prisma.user.findFirst({
    where: { role: "MANAGER", department },
    orderBy: { name: "asc" },
  });
}
