"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RequestSearchBar } from "@/components/request-search-bar";
import { RequestTable } from "@/components/request-table";
import { titleCase } from "@/lib/format";
import { matchesRequestSearch } from "@/lib/request-search";
import type { DashboardStats, RequestDto } from "@/lib/types";

type BoardFilter =
  | { kind: "all" }
  | { kind: "status"; value: "OPEN" | "ACTIVE" | "FINALIZED" }
  | { kind: "sla" }
  | { kind: "department"; value: string };

export function DashboardBoard({
  stats,
  requests,
}: {
  stats: DashboardStats;
  requests: RequestDto[];
}) {
  const [boardFilter, setBoardFilter] = useState<BoardFilter>({ kind: "all" });
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    return requests.filter((request) => {
      const matchesBoard =
        boardFilter.kind === "all"
          ? true
          : boardFilter.kind === "status"
            ? request.status === boardFilter.value
            : boardFilter.kind === "sla"
              ? request.sla.breached
              : request.department === boardFilter.value;

      return matchesBoard && matchesRequestSearch(request, searchQuery);
    });
  }, [boardFilter, requests, searchQuery]);

  const statusCards = [
    {
      key: "all",
      label: "Total",
      value: stats.total,
      filter: { kind: "all" } as BoardFilter,
    },
    {
      key: "open",
      label: "Open",
      value: stats.open,
      filter: { kind: "status", value: "OPEN" } as BoardFilter,
    },
    {
      key: "active",
      label: "Active",
      value: stats.active,
      filter: { kind: "status", value: "ACTIVE" } as BoardFilter,
    },
    {
      key: "finalized",
      label: "Finalized",
      value: stats.finalized,
      filter: { kind: "status", value: "FINALIZED" } as BoardFilter,
    },
    {
      key: "sla",
      label: "SLA breaches",
      value: stats.slaBreaches,
      filter: { kind: "sla" } as BoardFilter,
      accent: true,
    },
  ];

  const sidebarCards = [
    ...statusCards,
    ...Object.entries(stats.departments).map(([department, count]) => ({
      key: department,
      label: titleCase(department),
      value: count,
      filter: { kind: "department", value: department } as BoardFilter,
      accent: false,
    })),
  ];

  const hasActiveSearch = searchQuery.trim().length > 0;
  const hasActiveBoardFilter = boardFilter.kind !== "all";

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <aside className="w-full shrink-0 lg:w-[30%]">
        <div className="flex flex-col gap-2">
          {sidebarCards.map((card) => (
            <FilterCard
              key={card.key}
              label={card.label}
              value={card.value}
              accent={"accent" in card ? Boolean(card.accent) : false}
              active={isSameFilter(boardFilter, card.filter)}
              onClick={() => setBoardFilter(card.filter)}
            />
          ))}
        </div>
      </aside>

      <section className="min-w-0 w-full lg:w-[70%]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-800">
            Requests
            <span className="ml-2 font-normal text-zinc-500">
              ({filtered.length} shown)
            </span>
          </h2>
          <Link href="/" className="text-sm text-[var(--neo-accent)] hover:underline">
            Create new
          </Link>
        </div>

        <div className="mb-3">
          <RequestSearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        <RequestTable
          requests={filtered}
          emptyTitle={
            hasActiveSearch || hasActiveBoardFilter
              ? "No requests found"
              : "No requests yet."
          }
          emptyDescription={
            hasActiveSearch || hasActiveBoardFilter
              ? "Try changing your search or filters."
              : undefined
          }
        />
      </section>
    </div>
  );
}

function FilterCard({
  label,
  value,
  accent = false,
  active,
  onClick,
}: {
  label: string;
  value: number;
  accent?: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
        active
          ? "border-teal-600 bg-teal-600 text-white shadow-sm"
          : "border-teal-100 bg-white text-slate-800 hover:border-teal-300 hover:bg-teal-50"
      }`}
    >
      <p
        className={`text-xs font-medium tracking-wide uppercase ${
          active ? "text-teal-50" : "text-slate-500"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-xl font-semibold ${
          active
            ? "text-white"
            : accent
              ? "text-rose-600"
              : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </button>
  );
}

function isSameFilter(a: BoardFilter, b: BoardFilter) {
  if (a.kind !== b.kind) {
    return false;
  }
  if (a.kind === "status" && b.kind === "status") {
    return a.value === b.value;
  }
  if (a.kind === "department" && b.kind === "department") {
    return a.value === b.value;
  }
  return true;
}
