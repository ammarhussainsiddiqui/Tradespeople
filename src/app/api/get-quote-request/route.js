import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
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
    // Parse the query parameters from the request URL
    // const { searchParams } = new URL(request.url);
    // const tradepersonId = searchParams.get('tradepersonId');

    const { tradepersonId } = await request.json();

    // Check if tradepersonId is provided
    if (!tradepersonId) {
      return NextResponse.json(
        { error: "Missing tradepersonId parameter" },
        { status: 400 }
      );
    }

    // Query Prisma to find all quotes by tradepersonId
    const quotes = await prisma.quotes.findMany({
      where: {
        tradepersonId: parseInt(tradepersonId),
      },
      include: {
        job: {
          include:{
            jobStatus:true,
          }
        },  // Include related job details
        user: true, // Include related user details
        
      },
    });

    // Check if any quotes were found
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
          message: 'No quotes found for the given tradepersonId.',
        },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
