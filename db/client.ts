// db/client.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // Evita crear múltiples instancias en desarrollo
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
