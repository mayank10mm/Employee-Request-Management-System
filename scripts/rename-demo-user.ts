import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.request.updateMany({
    where: {
      OR: [
        { employeeEmail: "abc@gmail.com" },
        { employeeEmail: "mayank@example.com" },
        { employeeEmail: "employee@company.com" },
      ],
    },
    data: {
      employeeName: "Demo Employee",
      employeeEmail: "employee@company.com",
    },
  });

  await prisma.user.upsert({
    where: { email: "employee@company.com" },
    update: { name: "Demo Employee", role: "EMPLOYEE" },
    create: {
      name: "Demo Employee",
      email: "employee@company.com",
      role: "EMPLOYEE",
    },
  });

  for (const email of ["abc@gmail.com", "mayank@example.com"]) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      await prisma.user.delete({ where: { id: existing.id } }).catch(() => undefined);
    }
  }

  console.log("Demo employee set to Demo Employee <employee@company.com>");
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
