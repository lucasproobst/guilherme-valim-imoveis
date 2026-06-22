/**
 * Popula a tabela Condominio com a lista inicial (idempotente).
 * Uso: npx tsx scripts/seed-condominios.ts
 */
import { PrismaClient } from "@prisma/client";
import { CONDOMINIOS } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  for (const nome of CONDOMINIOS) {
    await prisma.condominio.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
  }
  const total = await prisma.condominio.count();
  console.log(`Condomínios na tabela: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
