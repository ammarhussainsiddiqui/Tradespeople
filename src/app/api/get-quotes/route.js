import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';

const prisma = new PrismaClient();

export async function GET(request) {
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
    // Parse the query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    // Validate that jobId is provided
    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          message: 'jobId is required',
        },
        { status: 400 }
      );
    }

    // Query Prisma to find all quotes by jobId where quotePrice is not null
    const quotes = await prisma.quotes.findMany({
      where: {
        jobId: parseInt(jobId),
        quotePrice: {
          not: null, // Ensure the quotePrice is not null
        },
      },
      include: {
        tradeperson: true, // Include tradeperson details in the response
      },
    });

    if (quotes.length > 0) {
      return NextResponse.json(
        {
          success: true,
          quotes,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'No quotes found for the given jobId or all quotes have null prices.',
        },
        { status: 200 }
      );
    }
  } catch (error) {
    Sentry.captureException('Error retrieving quotes:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
