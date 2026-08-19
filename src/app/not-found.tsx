import Link from "next/link";
import { getDemoSession } from "@/lib/demo-session";

export default async function NotFound() {
  const session = await getDemoSession();
  const href =
    session?.role === "EMPLOYER"
      ? "/dashboard"
      : session?.role === "EMPLOYEE"
        ? "/my-requests"
        : "/login";

  return (
    <div className="neo-page flex min-h-full items-center justify-center px-6 py-16">
      <div className="neo-surface max-w-md p-8 text-center">
        <h1 className="text-2xl font-semibold text-[var(--neo-text)]">
          Request not found
        </h1>
        <p className="mt-2 text-sm text-[var(--neo-muted)]">
          That ticket ID does not exist.
        </p>
        <Link
          href={href}
          className="neo-btn-primary mt-6 inline-flex px-4 py-2.5 text-sm"
        >
          Go back
        </Link>
      </div>
    </div>
  );
}
