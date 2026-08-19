"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { DemoSession } from "@/lib/demo-auth";

export function AppShell({
  children,
  title,
  subtitle,
  wide = false,
  session,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  wide?: boolean;
  session: DemoSession;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const links =
    session.role === "EMPLOYEE"
      ? [
          { href: "/", label: "Submit request" },
          { href: "/my-requests", label: "My requests" },
        ]
      : [
          { href: "/dashboard", label: "Admin dashboard" },
          { href: "/", label: "Add request" },
          { href: "/search", label: "Search requests" },
        ];

  async function switchUser() {
    await fetch("/api/demo-session", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="neo-page">
      <header className="neo-header">
        <div
          className={`mx-auto flex w-full flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between ${
            wide ? "max-w-7xl" : "max-w-5xl"
          }`}
        >
          <div>
            <Link
              href={session.role === "EMPLOYER" ? "/dashboard" : "/"}
              className="text-sm font-semibold tracking-wide text-teal-700"
            >
              PulseFit Requests
            </Link>
            <p className="mt-1 text-xs text-slate-500">
              Fitness ops helpdesk ·{" "}
              {session.role === "EMPLOYEE" ? "Employee" : "Employer"} ·{" "}
              {session.name} · {session.email}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex flex-wrap gap-2">
              {links.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3.5 py-2 text-sm font-medium ${
                      active ? "neo-btn-active neo-btn" : "neo-btn"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <button
              type="button"
              onClick={switchUser}
              className="neo-btn px-3.5 py-2 text-sm text-slate-600"
            >
              Switch user
            </button>
          </div>
        </div>
      </header>

      <main
        className={`mx-auto w-full px-6 py-10 ${wide ? "max-w-7xl" : "max-w-5xl"}`}
      >
        <div className="mb-8">
          <p className="mb-2 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 ring-1 ring-orange-200">
            Built for fitness teams
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {subtitle}
            </p>
          ) : null}
        </div>
        {children}
      </main>
    </div>
  );
}
