import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { MyRequestsPanel } from "@/components/my-requests-panel";
import { DEMO_USERS } from "@/lib/demo-auth";
import { getDemoSession } from "@/lib/demo-session";

export default async function MyRequestsPage() {
  const session = await getDemoSession();
  if (!session || session.role !== "EMPLOYEE") {
    redirect("/login");
  }

  const employee = DEMO_USERS.EMPLOYEE;

  return (
    <AppShell
      session={session}
      title="My requests"
      subtitle="Your submitted tickets for this employee account."
    >
      <MyRequestsPanel
        employeeName={employee.name}
        employeeEmail={employee.email}
      />
    </AppShell>
  );
}
