import type { RequestDto } from "@/lib/types";

export function matchesRequestSearch(request: RequestDto, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const haystack = [
    request.requestCode,
    request.subject,
    request.description,
    request.employeeName,
    request.employeeEmail,
    request.assignedTo?.name ?? "",
    request.assignedTo?.email ?? "",
    request.department,
    request.status,
    request.priority,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}
