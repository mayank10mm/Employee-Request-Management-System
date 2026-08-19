import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SearchRequestsPanel } from "@/components/search-requests-panel";
import { getDemoSession } from "@/lib/demo-session";

export default async function SearchRequestsPage() {
  const session = await getDemoSession();
  if (!session || session.role !== "EMPLOYER") {
    redirect(session?.role === "EMPLOYEE" ? "/" : "/login");
  }

  return (
    <AppShell
      session={session}
      title="Search requests"
      subtitle="Look up tickets by employee email."
    >
      <SearchRequestsPanel />
    </AppShell>
  );
}
