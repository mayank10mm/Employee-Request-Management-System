import { titleCase } from "@/lib/format";

const statusStyles: Record<string, string> = {
  OPEN: "bg-sky-50 text-sky-700 border-sky-200",
  ACTIVE: "bg-amber-50 text-amber-800 border-amber-200",
  FINALIZED: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

const priorityStyles: Record<string, string> = {
  LOW: "bg-slate-50 text-slate-600 border-slate-200",
  MEDIUM: "bg-teal-50 text-teal-800 border-teal-200",
  HIGH: "bg-orange-50 text-orange-800 border-orange-200",
  CRITICAL: "bg-rose-50 text-rose-800 border-rose-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[status] ?? statusStyles.OPEN}`}
    >
      {titleCase(status)}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${priorityStyles[priority] ?? priorityStyles.MEDIUM}`}
    >
      {titleCase(priority)}
    </span>
  );
}

export function DepartmentBadge({ department }: { department: string }) {
  return (
    <span className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800">
      {titleCase(department)}
    </span>
  );
}

export function SlaBadge({
  remainingMs,
  breached,
}: {
  remainingMs: number;
  breached: boolean;
}) {
  const overdue = breached || remainingMs <= 0;
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        overdue
          ? "border-rose-200 bg-rose-50 text-rose-800"
          : "border-lime-200 bg-lime-50 text-lime-800"
      }`}
    >
      {overdue ? "SLA breached" : "Within SLA"}
    </span>
  );
}
