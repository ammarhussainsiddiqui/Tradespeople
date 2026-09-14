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
        return NextResponse.json({
            success: false,
            message: authResult.error,
        }, { status: authResult.status });
    }

  try {
    
    //Parse the request body to get the requestId 
    const { requestId } = await req.json();


    // Validate the requestId
    const parsedRequestId = parseInt(requestId, 10);
    if (isNaN(parsedRequestId)) {
      return NextResponse.json(
        { error: 'Invalid requestId. Must be a valid integer.' },
        { status: 400 }
      );
    }

    // Fetch the reviews for the given requestId
    const reviews = await prisma.reviews.findMany({
      where: { requestId: parsedRequestId },
    //   include: {
    //     request: true, // Optionally include related request information
    //   },
      orderBy: {
        createdAt: 'desc', // Optionally sort reviews by creation date (most recent first)
      },
    });

    // If no reviews found
    if (!reviews || reviews.length === 0) {
      return NextResponse.json(
        { error: 'No reviews found for this request.' },
        { status: 404 }
      );
    }
    // Return the reviews
    return NextResponse.json({
      success: true,
      reviews,
    }, { status: 200 });
  } catch (error) {
    Sentry.captureException('Error fetching reviews:', error);

    return NextResponse.json(
      { error: 'An error occurred while fetching the reviews.' },
      { status: 500 }
    );
  }
}




