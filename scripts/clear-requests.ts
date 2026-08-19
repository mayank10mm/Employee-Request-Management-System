import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const history = await prisma.requestHistory.deleteMany();
  const requests = await prisma.request.deleteMany();
  console.log({
    historyDeleted: history.count,
    requestsDeleted: requests.count,
  });
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
