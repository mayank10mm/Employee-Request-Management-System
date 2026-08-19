import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DashboardBoard } from "@/components/dashboard-board";
import { getDemoSession } from "@/lib/demo-session";
import {
  getDashboardStats,
  listRequests,
  toRequestDto,
} from "@/lib/request-service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getDemoSession();
  if (!session || session.role !== "EMPLOYER") {
    redirect(session?.role === "EMPLOYEE" ? "/" : "/login");
  }

  const [stats, requests] = await Promise.all([
    getDashboardStats(),
    listRequests(),
  ]);

  return (
    <AppShell
      wide
      session={session}
      title="Admin dashboard"
      subtitle="Employer view — click a status or department card to filter requests."
    >
      <DashboardBoard stats={stats} requests={requests.map(toRequestDto)} />
    </AppShell>
  );
}
