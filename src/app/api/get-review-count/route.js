import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';

const prisma = new PrismaClient();

export async function POST(req) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];
  const authResult = await authenticateToken(token);

  if (authResult.error) {
    return NextResponse.json(
      {
        success: false,
        message: authResult.error,
      },
      { status: authResult.status }
    );
  }

  try {
    // Parse the request body to get the requestId
    
    const { requestId } = await req.json();
    

    // Validate the requestId
    const parsedRequestId = parseInt(requestId, 10);
    if (isNaN(parsedRequestId)) {
      return NextResponse.json(
        { error: 'Invalid requestId. Must be a valid integer.' },
        { status: 400 }
      );
    }

    // Fetch the review count for the given requestId
    const reviewCount = await prisma.reviews.count({
      where: { requestId: parsedRequestId },
    });

    return NextResponse.json(
      {
        success: true,
        reviewCount,
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException('Error fetching review count:', error);

    return NextResponse.json(
      { error: 'An error occurred while fetching the review count.' },
      { status: 500 }
    );
  }
}
