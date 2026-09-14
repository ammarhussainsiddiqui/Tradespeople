import { NextResponse } from 'next/server'; 
import { PrismaClient } from '@prisma/client'; 
import * as Sentry from '@sentry/nextjs';

const prisma = new PrismaClient(); 

export async function POST(req) {    

  try {
   
    // Parse the request body
    const { requestId, message, rating } = await req.json();
    //Validate inputs
    if (!requestId || !message || rating === undefined) {
      return NextResponse.json(
        { error: 'All fields are required: requestId, message, rating.' },
        { status: 400 }
      );
    }

    // Convert requestId to an integer
    const parsedRequestId = parseInt(requestId, 10); // Use base 10 to avoid unexpected results
    if (isNaN(parsedRequestId)) {
      return NextResponse.json(
        { error: 'Invalid requestId. Must be a valid integer.' },
        { status: 400 }
      );
    }

    // Verify the Request exists
    const existingRequest = await prisma.request.findUnique({
      where: { id: parsedRequestId },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Request not found.' },
        { status: 404 }
      );
    }

    // Create the review in the database
    const newReview = await prisma.reviews.create({
      data: {
        message,
        rating,
        requestId: parsedRequestId, 
        reviewType : "tradeperson",
      },
    });
    // Update the 'isReviewed' flag to true in the Request model
    await prisma.request.update({
        where: { id: parsedRequestId },
        data: { isReviewed: true },
      });



    // Return the created review
    return NextResponse.json(
      {
        success: true,
        message: 'Review posted successfully.',
        review: newReview,
      },
      { status: 201 }
    );
  } catch (error) {
    Sentry.captureException('Error creating review:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the review.' },
      { status: 500 }
    );
  }
}
