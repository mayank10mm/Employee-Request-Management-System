"use client";

import { FormEvent, useState } from "react";
import { RequestTable } from "@/components/request-table";
import type { RequestDto } from "@/lib/types";

export function SearchRequestsPanel() {
  const [email, setEmail] = useState("");
  const [requests, setRequests] = useState<RequestDto[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextEmail = email.trim().toLowerCase();
    if (!nextEmail) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/requests?email=${encodeURIComponent(nextEmail)}`,
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not load requests.");
      }

      setRequests((data.requests ?? []) as RequestDto[]);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load requests.");
      setRequests([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form
        onSubmit={onSubmit}
        className="neo-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-end"
      >
        <label className="block flex-1">
      <span className="mb-1.5 block text-sm font-medium text-[var(--neo-text)]">
            Employee email
          </span>
          <input
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="employee@company.com"
            className="field-input"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="neo-btn-primary px-4 py-2.5 text-sm disabled:opacity-60"
        >
          {loading ? "Searching…" : "Search requests"}
        </button>
      </form>

      {error ? (
        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      <div className="mt-6">
        {!searched ? (
          <div className="neo-inset px-6 py-12 text-center text-sm text-[var(--neo-muted)]">
            Enter an employee email to find that person’s tickets.
          </div>
        ) : (
          <RequestTable
            requests={requests}
            emptyTitle="No requests found"
            emptyDescription="Try a different employee email."
          />
        )}
      </div>
    </div>
  );
}
