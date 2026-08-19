import Link from "next/link";
import {
  DepartmentBadge,
  PriorityBadge,
  SlaBadge,
  StatusBadge,
} from "@/components/badges";
import { formatDateTime, formatSlaLabel } from "@/lib/format";
import type { RequestDto } from "@/lib/types";

export function RequestTable({
  requests,
  emptyTitle = "No requests yet.",
  emptyDescription,
}: {
  requests: RequestDto[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (requests.length === 0) {
    return (
      <div className="neo-inset px-6 py-12 text-center">
        <p className="text-sm font-medium text-[var(--neo-text)]">{emptyTitle}</p>
        {emptyDescription ? (
          <p className="mt-1 text-sm text-[var(--neo-muted)]">{emptyDescription}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="neo-surface overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200/70 text-left text-sm">
        <thead className="text-xs tracking-wide text-[var(--neo-muted)] uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">ID</th>
            <th className="px-4 py-3 font-medium">Subject</th>
            <th className="px-4 py-3 font-medium">Dept</th>
            <th className="px-4 py-3 font-medium">Priority</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">SLA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/60">
          {requests.map((request) => (
            <tr key={request.id} className="hover:bg-white/30">
              <td className="px-4 py-3 font-mono text-xs">
                <Link
                  href={`/requests/${request.requestCode}`}
                  className="font-medium text-[var(--neo-accent)] underline-offset-2 hover:underline"
                >
                  {request.requestCode}
                </Link>
                <div className="mt-1 text-[11px] text-[var(--neo-muted)]">
                  {formatDateTime(request.createdAt)}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="max-w-xs font-medium text-[var(--neo-text)]">
                  {request.subject}
                </div>
                <div className="mt-1 text-xs text-[var(--neo-muted)]">
                  {request.assignedTo?.name ?? "Unassigned"}
                </div>
              </td>
              <td className="px-4 py-3">
                <DepartmentBadge department={request.department} />
              </td>
              <td className="px-4 py-3">
                <PriorityBadge priority={request.priority} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={request.status} />
              </td>
              <td className="px-4 py-3">
                <div className="space-y-1">
                  <SlaBadge
                    remainingMs={request.sla.resolutionRemainingMs}
                    breached={request.sla.breached}
                  />
                  <div className="text-[11px] text-zinc-500">
                    {formatSlaLabel(
                      request.sla.resolutionRemainingMs,
                      request.sla.breached,
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
