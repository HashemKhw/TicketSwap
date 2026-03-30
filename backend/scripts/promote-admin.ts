/**
 * Usage: npx tsx scripts/promote-admin.ts user@example.com
 * Sets role to ADMIN for that user (local/dev helper).
 */
import "dotenv/config";
import { prisma } from "../src/prisma.js";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npx tsx scripts/promote-admin.ts <email>");
  process.exit(1);
}

async function main() {
  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });
  console.log("Updated:", user.email, "→ ADMIN");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
