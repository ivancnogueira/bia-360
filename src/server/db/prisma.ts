import { PrismaClient } from "@prisma/client";

declare global {
  var prismaGlobalInstance: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobalInstance ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobalInstance = prisma;
}

export default prisma;

