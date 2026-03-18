import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_EMAIL ?? "admin@local.dev";
  const password = process.env.SEED_PASSWORD ?? "changeme";

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      passwordHash,
      name: "Admin",
    },
  });

  console.log(`✅ Seeded user: ${user.email}`);

  // Upsert default AppSettings singleton
  const settings = await prisma.appSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      electricityRateKwh: 0.12,
      printerWattage: 200,
      laborRatePerHour: 15.0,
      defaultPlatformFee: 6.5,
      currencySymbol: "$",
      lowStockThresholdG: 100,
    },
  });

  console.log(`✅ Seeded AppSettings: id=${settings.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
