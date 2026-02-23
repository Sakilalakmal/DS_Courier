import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const roles = [
  { code: "admin", label: "Administrator" },
  { code: "dispatcher", label: "Dispatcher" },
  { code: "supervisor", label: "Supervisor" },
  { code: "driver", label: "Driver" },
  { code: "customer", label: "Customer" },
] as const;

async function main() {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: { label: role.label },
      create: role,
    });
  }
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
