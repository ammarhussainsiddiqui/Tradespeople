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
      // Parse the request body to get jobId, tradePersonId, and userId
      const { jobId, tradepersonId, userId } = await req.json();
  
      // Validate the jobId, tradePersonId, and userId
      const parsedJobId = parseInt(jobId, 10);
      const parsedTradePersonId = parseInt(tradepersonId, 10);
      const parsedUserId = parseInt(userId, 10);
      if (isNaN(parsedJobId) || isNaN(parsedTradePersonId) || isNaN(parsedUserId)) {
        Sentry.captureException('Invalid jobId, tradePersonId, or userId provided.');
        return NextResponse.json(
          { success: false, error: 'Invalid input. jobId, tradePersonId, and userId must be valid integers.' },
          { status: 400 }
        );
      }
  
      // Check if a request exists for the given jobId
      const request = await prisma.request.findFirst({
       // where: { jobId: parsedJobId },
       where: { 
        userId: parsedUserId,
        tradepersonId: parsedTradePersonId,
        jobId: parsedJobId,
      },
      });
  
      if (!request) {
        Sentry.captureException(`No request found for jobId: ${parsedJobId}`);
        return NextResponse.json(
          { success: false, message: 'No request exists for this job.' },
          { status: 404 }
        );
      }
  
      // Fetch the reviews for the specific combination of jobId, tradePersonId, and userId
      const reviews = await prisma.reviews.findMany({
        where: {
          requestId: request.id, // Use the request ID from the found request
        },
        // include: {
        //   request: true, // Optionally include related request information
        // },
        select: {
          id: true,
          message: true,
          rating: true,
          createdAt: true,
          reviewType: true,
          request: true,
        },
        // orderBy: {
        //   createdAt: 'desc', // Sort reviews by creation date (most recent first)
        // },
      });
  
  
      // If no reviews found for the specific combination
      if (!reviews || reviews.length === 0) {
        return NextResponse.json(
          { success: true, message: 'No reviews available.', reviews: [] },
          { status: 200 }
        );
      }
  
      // Return the reviews
      return NextResponse.json(
        {
          success: true,
          requestId: request.id,
          reviews,
        },
        { status: 200 }
      );
    } catch (error) {
      Sentry.captureException('Error fetching reviews:', error);

  
      return NextResponse.json(
        { success: false, error: 'An error occurred while fetching the reviews.' },
        { status: 500 }
      );
    }
  }
  
  
  