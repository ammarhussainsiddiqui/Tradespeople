import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../../authenticateToken'; // Import your token authentication logic
import * as Sentry from '@sentry/nextjs';
const prisma = new PrismaClient();

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];
  const authResult = await authenticateToken(token);

  if (authResult.error) {
    return NextResponse.json(
      { success: false, message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required.' },
        { status: 400 }
      );
    }

    // Fetch job counts grouped by status
    const jobCounts = await prisma.jobs.groupBy({
        by: ['statusId'],
        _count: { statusId: true },
        where: {
          userId: parseInt(userId),
          NOT: {
            OR: [
              { statusId: Number(process.env.DELETED_STATUS_ID) },
              { statusId: Number(process.env.REOPENED_STATUS_ID) },
            ],
          },
        },
      });

    const result = jobCounts.reduce((acc, job) => {
      acc[job.statusId] = job._count.statusId;
      return acc;
    }, {});

    // Return the counts
    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException('Error fetching job counts:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
