import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;
const demoProfessorId = process.env.DEMO_PROFESSOR_ID;

if (!connectionString) {
  throw new Error("DATABASE_URL no está definida");
}
if (!demoProfessorId) {
  throw new Error("DEMO_PROFESSOR_ID no está definida");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

try {
  const demoUser = await prisma.user.upsert({
    where: { id: demoProfessorId },
    update: {
      email: "profesor.demo@portalayudantes.local",
      name: "Profesor Demostración",
      role: "PROFESSOR",
    },
    create: {
      id: demoProfessorId,
      email: "profesor.demo@portalayudantes.local",
      name: "Profesor Demostración",
      passwordHash: "DEMO_ONLY_NO_LOGIN",
      role: "PROFESSOR",
    },
  });

  console.log(`Profesor de demostración disponible: ${demoUser.id}`);
} finally {
  await prisma.$disconnect();
}
