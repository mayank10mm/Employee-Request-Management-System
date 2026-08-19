"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { RequestDto } from "@/lib/types";

export function StatusActions({ request }: { request: RequestDto }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(status: "ACTIVE" | "FINALIZED") {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/requests/${request.requestCode}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not update status.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update status.");
    } finally {
      setLoading(false);
    }
  }

  if (request.status === "FINALIZED") {
    return (
      <p className="neo-inset px-3 py-2 text-sm text-emerald-700">
        This request is finalized and archived for reporting.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {request.status === "OPEN" ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => updateStatus("ACTIVE")}
            className="neo-btn-primary px-4 py-2.5 text-sm disabled:opacity-60"
          >
            {loading ? "Updating…" : "Start working"}
          </button>
        ) : null}
        {request.status === "ACTIVE" ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => updateStatus("FINALIZED")}
            className="neo-btn-primary px-4 py-2.5 text-sm text-emerald-700 disabled:opacity-60"
          >
            {loading ? "Updating…" : "Mark resolved"}
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}
