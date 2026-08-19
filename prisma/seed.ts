import { Department, PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.requestHistory.deleteMany();
  await prisma.request.deleteMany();
  await prisma.user.deleteMany();

  const agents = [
    { name: "Priya", email: "priya.hr@company.local", role: Role.AGENT, department: Department.HR },
    { name: "Rahul", email: "rahul.hr@company.local", role: Role.AGENT, department: Department.HR },
    { name: "Amit", email: "amit.it@company.local", role: Role.AGENT, department: Department.IT },
    { name: "Neha", email: "neha.it@company.local", role: Role.AGENT, department: Department.IT },
    { name: "Ankit", email: "ankit.payroll@company.local", role: Role.AGENT, department: Department.PAYROLL },
    { name: "Riya", email: "riya.payroll@company.local", role: Role.AGENT, department: Department.PAYROLL },
    { name: "Vikram", email: "vikram.ops@company.local", role: Role.AGENT, department: Department.OPERATIONS },
    { name: "Sneha", email: "sneha.ops@company.local", role: Role.AGENT, department: Department.OPERATIONS },
  ];

  const leads = [
    { name: "HR Lead", email: "lead.hr@company.local", role: Role.MANAGER, department: Department.HR },
    { name: "IT Lead", email: "lead.it@company.local", role: Role.MANAGER, department: Department.IT },
    { name: "Payroll Lead", email: "lead.payroll@company.local", role: Role.MANAGER, department: Department.PAYROLL },
    { name: "Ops Lead", email: "lead.ops@company.local", role: Role.MANAGER, department: Department.OPERATIONS },
  ];

  await prisma.user.createMany({
    data: [
      {
        name: "Demo Employee",
        email: "employee@company.com",
        role: Role.EMPLOYEE,
      },
      ...agents,
      ...leads,
    ],
  });

  const counts = await prisma.user.groupBy({
    by: ["role"],
    _count: { _all: true },
  });

  console.log("Seed complete:", counts);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
