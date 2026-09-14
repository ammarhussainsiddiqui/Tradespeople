import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/nextjs';
const prisma = new PrismaClient();

const dbConnect = async () => {
  // Optionally you can add any custom logic before connecting
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL');
  } catch (error) {
    //console.error('Failed to connect to PostgreSQL:', error);
    Sentry.captureException('Failed to connect to PostgreSQL:', error);
    throw error;
  }
  return prisma;
};

export default dbConnect;
