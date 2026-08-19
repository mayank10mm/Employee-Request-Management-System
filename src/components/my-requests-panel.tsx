"use client";

import { useEffect, useState } from "react";
import { RequestTable } from "@/components/request-table";
import type { RequestDto } from "@/lib/types";

export function MyRequestsPanel({
  employeeName,
  employeeEmail,
}: {
  employeeName: string;
  employeeEmail: string;
}) {
  const [requests, setRequests] = useState<RequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/requests?email=${encodeURIComponent(employeeEmail)}`,
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Could not load requests.");
        }
        if (!cancelled) {
          setRequests((data.requests ?? []) as RequestDto[]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load requests.",
          );
          setRequests([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [employeeEmail]);

  return (
    <div>
      <div className="neo-surface px-5 py-4">
        <p className="text-xs font-medium tracking-wide text-[var(--neo-muted)] uppercase">
          Signed in as
        </p>
        <p className="mt-1 text-sm font-medium text-[var(--neo-text)]">
          {employeeName} · {employeeEmail}
        </p>
        <p className="mt-1 text-xs text-[var(--neo-muted)]">
          Demo employee view — tickets are scoped to your account (no password
          login in this PoC).
        </p>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      <div className="mt-6">
        {loading ? (
          <div className="neo-inset px-6 py-12 text-center text-sm text-[var(--neo-muted)]">
            Loading your requests…
          </div>
        ) : (
          <RequestTable
            requests={requests}
            emptyTitle="No requests yet"
            emptyDescription="Submit a request from the portal and it will appear here."
          />
        )}
      </div>
    </div>
  );
}
