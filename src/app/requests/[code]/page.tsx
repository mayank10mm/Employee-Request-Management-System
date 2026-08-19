import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import {
  DepartmentBadge,
  PriorityBadge,
  SlaBadge,
  StatusBadge,
} from "@/components/badges";
import { StatusActions } from "@/components/status-actions";
import { formatDateTime, formatSlaLabel, titleCase } from "@/lib/format";
import { getDemoSession } from "@/lib/demo-session";
import { RequestError, getRequestByCode, toRequestDto } from "@/lib/request-service";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ code: string }>;
};

export default async function RequestDetailPage({ params }: PageProps) {
  const session = await getDemoSession();
  if (!session) {
    redirect("/login");
  }

  const { code } = await params;

  let request;
  try {
    request = toRequestDto(await getRequestByCode(code));
  } catch (error) {
    if (error instanceof RequestError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  if (
    session.role === "EMPLOYEE" &&
    request.employeeEmail.toLowerCase() !== session.email.toLowerCase()
  ) {
    redirect("/my-requests");
  }

  const backHref = session.role === "EMPLOYER" ? "/dashboard" : "/my-requests";
  const backLabel =
    session.role === "EMPLOYER" ? "Back to dashboard" : "Back to my requests";

  return (
    <AppShell
      session={session}
      title={request.requestCode}
      subtitle={request.subject}
    >
      <div className="mb-4">
        <Link href={backHref} className="text-sm text-[var(--neo-accent)] hover:underline">
          ← {backLabel}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="space-y-6">
          <div className="neo-surface p-6">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={request.status} />
              <PriorityBadge priority={request.priority} />
              <DepartmentBadge department={request.department} />
              <SlaBadge
                remainingMs={request.sla.resolutionRemainingMs}
                breached={request.sla.breached}
              />
            </div>

            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[var(--neo-text)]">
              {request.description}
            </p>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <Meta
                label="Employee"
                value={`${request.employeeName} · ${request.employeeEmail}`}
              />
              <Meta
                label="Assigned to"
                value={
                  request.assignedTo
                    ? `${request.assignedTo.name} (${request.assignedTo.email})`
                    : "Unassigned"
                }
              />
              <Meta label="Created" value={formatDateTime(request.createdAt)} />
              <Meta
                label="SLA deadline"
                value={formatDateTime(request.slaDeadline)}
              />
              <Meta
                label="SLA status"
                value={formatSlaLabel(
                  request.sla.resolutionRemainingMs,
                  request.sla.breached,
                )}
              />
              <Meta label="Escalated to" value={request.escalatedTo ?? "—"} />
            </dl>
          </div>

          {session.role === "EMPLOYER" ? (
            <div className="neo-surface p-6">
              <h2 className="text-sm font-semibold text-[var(--neo-text)]">
                Agent actions
              </h2>
              <p className="mt-1 text-sm text-[var(--neo-muted)]">
                Move the ticket through Open → Active → Finalized.
              </p>
              <div className="mt-4">
                <StatusActions request={request} />
              </div>
            </div>
          ) : (
            <div className="neo-surface p-6">
              <h2 className="text-sm font-semibold text-[var(--neo-text)]">
                Employee view
              </h2>
              <p className="mt-1 text-sm text-[var(--neo-muted)]">
                Status updates are handled by the assigned department agent /
                employer dashboard.
              </p>
            </div>
          )}
        </section>

        <aside className="neo-surface p-6">
          <h2 className="text-sm font-semibold text-[var(--neo-text)]">Activity</h2>
          <ol className="mt-4 space-y-4">
            {request.history.map((entry) => (
              <li key={entry.id} className="border-l-2 border-teal-200 pl-3">
                <p className="text-xs font-medium tracking-wide text-teal-800 uppercase">
                  {titleCase(entry.action)}
                </p>
                <p className="mt-1 text-sm text-zinc-700">
                  {entry.detail ?? "—"}
                </p>
                <p className="mt-1 text-[11px] text-zinc-400">
                  {formatDateTime(entry.createdAt)}
                  {entry.performedBy ? ` · ${entry.performedBy.name}` : ""}
                </p>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </AppShell>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-[var(--neo-muted)] uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-[var(--neo-text)]">{value}</dd>
    </div>
  );
}
