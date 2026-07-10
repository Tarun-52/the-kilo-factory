import path from "node:path";
import type { PrismaConfig } from "prisma";

export default {
  earlyAccess: true,
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  seed: {
    command: "tsx prisma/seed.ts",
  },
} satisfies PrismaConfig;