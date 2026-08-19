import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { RequestForm } from "@/components/request-form";
import { DEMO_USERS } from "@/lib/demo-auth";
import { getDemoSession } from "@/lib/demo-session";

export default async function HomePage() {
  const session = await getDemoSession();
  if (!session) {
    redirect("/login");
  }

  const isEmployee = session.role === "EMPLOYEE";
  const employeeIdentity = DEMO_USERS.EMPLOYEE;

  return (
    <AppShell
      session={session}
      title={isEmployee ? "Employee request portal" : "Add request"}
      subtitle={
        isEmployee
          ? "Submit an internal request. The system generates an ID, categorizes the department, assigns an agent, and starts the SLA clock."
          : "Create a request on behalf of an employee. Name and email can be edited for the employee you are helping."
      }
    >
      <RequestForm
        employeeName={employeeIdentity.name}
        employeeEmail={employeeIdentity.email}
        lockIdentity={isEmployee}
        afterCreateHref={isEmployee ? "/my-requests" : "/dashboard"}
        afterCreateLabel={isEmployee ? "View my requests" : "Go to dashboard"}
      />
    </AppShell>
  );
}
