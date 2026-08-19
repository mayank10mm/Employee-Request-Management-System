"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DemoRole } from "@/lib/demo-auth";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<DemoRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function enterAs(role: DemoRole) {
    setLoading(role);
    setError(null);
    try {
      const response = await fetch("/api/demo-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not start demo session.");
      }
      router.push(role === "EMPLOYER" ? "/dashboard" : "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start demo session.");
      setLoading(null);
    }
  }

  return (
    <div className="neo-page flex min-h-full items-center justify-center px-6 py-16">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold tracking-wide text-teal-700">
            PulseFit Requests
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            Choose a demo role
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Internal request system for a fitness organization — leave, IT,
            payroll, and ops support in one place.
          </p>
        </div>

        <div className="grid items-stretch gap-5 md:grid-cols-2">
          <RoleCard
            title="Employee"
            subtitle="Demo Employee · employee@company.com"
            points={["Submit new requests", "Track your own tickets"]}
            loading={loading === "EMPLOYEE"}
            disabled={loading !== null}
            onClick={() => enterAs("EMPLOYEE")}
            accent="teal"
          />
          <RoleCard
            title="Employer"
            subtitle="employer@company.com"
            points={[
              "Admin dashboard",
              "Add employee requests",
              "Search by email",
              "Update ticket status",
            ]}
            loading={loading === "EMPLOYER"}
            disabled={loading !== null}
            onClick={() => enterAs("EMPLOYER")}
            accent="orange"
          />
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-center text-sm text-rose-700">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function RoleCard({
  title,
  subtitle,
  points,
  loading,
  disabled,
  onClick,
  accent,
}: {
  title: string;
  subtitle: string;
  points: string[];
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
  accent: "teal" | "orange";
}) {
  const bar =
    accent === "teal"
      ? "from-teal-500 to-emerald-400"
      : "from-orange-500 to-amber-400";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-teal-100 bg-white p-0 text-left shadow-[0_8px_24px_rgba(15,118,110,0.08)] transition hover:-translate-y-0.5 disabled:opacity-60"
    >
      <div className={`h-1.5 w-full shrink-0 bg-gradient-to-r ${bar}`} />
      <div className="flex flex-1 flex-col p-6 pt-5">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          {points.map((point) => (
            <li key={point}>• {point}</li>
          ))}
        </ul>
        <span className="neo-btn-primary mt-auto inline-flex w-fit px-4 py-2 text-sm">
          {loading ? "Entering…" : `Continue as ${title}`}
        </span>
      </div>
    </button>
  );
}
