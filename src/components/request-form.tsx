"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import type { RequestDto } from "@/lib/types";

const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export function RequestForm({
  employeeName,
  employeeEmail,
  lockIdentity = true,
  afterCreateHref = "/my-requests",
  afterCreateLabel = "View my requests",
}: {
  employeeName: string;
  employeeEmail: string;
  lockIdentity?: boolean;
  afterCreateHref?: string;
  afterCreateLabel?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<RequestDto | null>(null);
  const [name, setName] = useState(employeeName);
  const [email, setEmail] = useState(employeeEmail);

  useEffect(() => {
    setName(employeeName);
    setEmail(employeeEmail);
  }, [employeeName, employeeEmail]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = {
      employeeName: lockIdentity ? employeeName : name.trim(),
      employeeEmail: lockIdentity ? employeeEmail : email.trim(),
      subject: String(form.get("subject") ?? ""),
      description: String(form.get("description") ?? ""),
      priority: String(form.get("priority") ?? "MEDIUM"),
    };

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to submit request.");
      }

      setCreated(data.request as RequestDto);
      formElement.reset();
      if (!lockIdentity) {
        setName(employeeName);
        setEmail(employeeEmail);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <form
        onSubmit={onSubmit}
        className="neo-surface p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="employeeName">
            <input
              id="employeeName"
              name="employeeName"
              required
              readOnly={lockIdentity}
              value={lockIdentity ? employeeName : name}
              onChange={
                lockIdentity
                  ? undefined
                  : (event) => setName(event.target.value)
              }
              className={`field-input ${lockIdentity ? "text-[var(--neo-muted)]" : ""}`}
              placeholder="Employee full name"
            />
          </Field>
          <Field label="Email" htmlFor="employeeEmail">
            <input
              id="employeeEmail"
              name="employeeEmail"
              type="email"
              required
              readOnly={lockIdentity}
              value={lockIdentity ? employeeEmail : email}
              onChange={
                lockIdentity
                  ? undefined
                  : (event) => setEmail(event.target.value)
              }
              className={`field-input ${lockIdentity ? "text-[var(--neo-muted)]" : ""}`}
              placeholder="employee@company.com"
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Subject" htmlFor="subject">
            <input
              id="subject"
              name="subject"
              required
              className="field-input"
              placeholder="Salary was not credited this month"
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Description" htmlFor="description">
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              className="field-input resize-y"
              placeholder="Describe the issue so the system can categorize and route it."
            />
          </Field>
        </div>

        <div className="mt-4 max-w-xs">
          <Field label="Priority" htmlFor="priority">
            <select
              id="priority"
              name="priority"
              defaultValue="MEDIUM"
              className="field-input"
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority.charAt(0) + priority.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="neo-btn-primary mt-6 inline-flex items-center justify-center px-4 py-2.5 text-sm transition disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit request"}
        </button>
      </form>

      <aside className="neo-surface p-6">
        <h2 className="text-sm font-semibold text-[var(--neo-text)]">What happens next</h2>
        <ol className="mt-4 space-y-3 text-sm leading-6 text-[var(--neo-muted)]">
          <li>1. A unique request ID is generated.</li>
          <li>2. Keywords auto-categorize the department.</li>
          <li>3. The least-loaded agent is assigned.</li>
          <li>4. An SLA clock starts from the chosen priority.</li>
        </ol>

        {created ? (
          <div className="neo-inset mt-6 p-4">
            <p className="text-xs font-medium tracking-wide text-[var(--neo-accent)] uppercase">
              Request created
            </p>
            <p className="mt-2 font-mono text-lg font-semibold text-[var(--neo-text)]">
              {created.requestCode}
            </p>
            <p className="mt-2 text-sm text-[var(--neo-muted)]">
              {created.department} · {created.status} ·{" "}
              {created.assignedTo?.name ?? "Unassigned"}
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-medium text-[var(--neo-accent)]">
              <a href={`/requests/${created.requestCode}`} className="underline">
                Open ticket
              </a>
              <a href={afterCreateHref} className="underline">
                {afterCreateLabel}
              </a>
            </div>
          </div>
        ) : (
          <p className="mt-6 text-sm text-[var(--neo-muted)]">
            Try subjects like “salary not credited”, “laptop wifi”, or “leave next
            Friday”.
          </p>
        )}
      </aside>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--neo-text)]">
        {label}
      </span>
      {children}
    </label>
  );
}
