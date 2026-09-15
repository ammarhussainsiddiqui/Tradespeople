import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as Sentry from '@sentry/nextjs';
import { getRequestUser, unauthorized } from "../../../lib/auth/session";

const prisma = new PrismaClient();

export async function POST(request) {
  // Notifications are always for the logged-in user; a userId in the body is ignored
  const user = await getRequestUser(request);
  if (!user) return unauthorized();

  try {
    const notifications = await prisma.request.findMany({
      where: {
        userId: user.id,
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
  }
}
