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
        const { userId, tradepersonId, jobId } = await request.json();

        // Validate query parameters
        if (!tradepersonId && !jobId) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Either tradepersonId or jobId is required',
                },
                { status: 400 }
            );
        }

        // Query Prisma to find a matching quote based on tradepersonId or jobId
        const quote = await prisma.quotes.findFirst({
            where: {
                userId: parseInt(userId),
                tradepersonId: parseInt(tradepersonId),
                jobId: parseInt(jobId)
            },
        });

        if (quote) {
            return NextResponse.json(
                {
                    success: true,
                    hasApplied: true,
                    quote,
                },
                { status: 200 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                hasApplied: false,
                quote: {
                    jobId: parseInt(jobId),
                    userId: parseInt(userId),
                    tradepersonId: parseInt(tradepersonId),
                    requested: false
                }
            },
            { status: 200 }
        );
        
    } catch (error) {
        Sentry.captureException('Error checking quote status:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
            },
            { status: 500 }
        );
    }
}

