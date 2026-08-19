import {
  createRequest,
  getDashboardStats,
  toRequestDto,
  updateRequestStatus,
} from "../src/lib/request-service";

async function main() {
  const salary = await createRequest({
    employeeName: "Demo Employee",
    employeeEmail: "employee@company.com",
    subject: "Salary was not credited this month",
    description: "My salary for August has not been credited to my bank account.",
    priority: "HIGH",
  });

  const laptop = await createRequest({
    employeeName: "Demo Employee",
    employeeEmail: "employee@company.com",
    subject: "Laptop is not connecting to WiFi",
    description: "My laptop cannot join the office wifi network.",
    priority: "MEDIUM",
  });

  const leave = await createRequest({
    employeeName: "Demo Employee",
    employeeEmail: "employee@company.com",
    subject: "I want to apply for leave next Friday",
    description: "Need one day of vacation leave.",
    priority: "LOW",
  });

  const started = await updateRequestStatus(laptop.requestCode, "ACTIVE");

  console.log(
    JSON.stringify(
      {
        salary: summary(salary),
        laptop: summary(laptop),
        leave: summary(leave),
        laptopAfterStart: summary(started),
        dashboard: await getDashboardStats(),
      },
      null,
      2,
    ),
  );
}

function summary(request: Awaited<ReturnType<typeof createRequest>>) {
  const dto = toRequestDto(request);
  return {
    requestCode: dto.requestCode,
    department: dto.department,
    status: dto.status,
    assignedTo: dto.assignedTo?.name ?? null,
    slaDeadline: dto.slaDeadline,
  };
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
