import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';

const prisma = new PrismaClient();

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];
  const authResult = await authenticateToken(token);
  
  if (authResult.error) {
      return NextResponse.json({
        success: false,
        message: authResult.error,
      }, { status: authResult.status });
  }
  try {
    const { userId } = await request.json();

    // Validate if userId is provided
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required.',
      }, { status: 400 });
    }

    // Fetch active subscription for the user
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userid: parseInt(userId),    // Convert userId to integer
        status: 'active',            // Ensure the subscription is active
      },
    });

    // Check if active subscription exists
    if (!activeSubscription) {
      return NextResponse.json({
        success: false,
        message: 'No active subscription found for the user.',
      }, { status: 404 });
    }

    // Return the active subscription data
    return NextResponse.json({
      success: true,
      subscription: activeSubscription,
    }, { status: 200 });

  } catch (error) {
    Sentry.captureException('Error fetching subscription:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve subscription.',
      details: error.message,
    }, { status: 500 });
  }
}
