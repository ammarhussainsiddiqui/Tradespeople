import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as Sentry from '@sentry/nextjs';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json(); // Parse the request body
    const { userId } = body; // Extract userId from the body

    const notifications = await prisma.request.findMany({
      where: {
        userId,
        isReviewed: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        tradeperson: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        job: {
          select: {
            job: true,// Assuming `job` contains job details
          },
        },
      },
    });

    // Directly return the raw notifications data
    return NextResponse.json(notifications);
  } catch (error) {
    Sentry.captureException("Error fetching review notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
 