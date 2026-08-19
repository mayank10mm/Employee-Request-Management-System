import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function withPrismaRetry<T>(operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    if (!isTransientDbError(error)) {
      throw error;
    }

    // Neon closes idle connections; reconnect once and retry.
    await prisma.$disconnect().catch(() => undefined);
    await prisma.$connect();
    return operation();
  }
}

function isTransientDbError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const message = "message" in error ? String(error.message) : "";
  return (
    message.includes("Closed") ||
    message.includes("Connection reset") ||
    message.includes("Server has closed the connection") ||
    message.includes("Can't reach database server")
  );
}
