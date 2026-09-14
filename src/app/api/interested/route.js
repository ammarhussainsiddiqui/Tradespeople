import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';

const prisma = new PrismaClient();

export async function PUT(request) {
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
        const { jobId, tradepersonId } = await request.json();

        if (!jobId || !tradepersonId) {
            return NextResponse.json({
                success: false,
                message: 'Invalid job ID or tradeperson ID.',
            }, { status: 400 });
        }

        // Fetch the job
        const job = await prisma.jobs.findUnique({
            where: { id: jobId },
            select: { interestedTradepersons: true },
        });

        if (!job) {
            return NextResponse.json({
                success: false,
                message: 'Job not found.',
            }, { status: 404 });
        }

        // Check if tradepersonId is already in the array
        const isInterested = job.interestedTradepersons.includes(tradepersonId);

        // Update the job
        const updatedJob = await prisma.jobs.update({
            where: { id: jobId },
            data: {
                interestedTradepersons: isInterested
                    ? { set: job.interestedTradepersons.filter(id => id !== tradepersonId) } // Remove the tradeperson ID
                    : { push: tradepersonId }, // Add the tradeperson ID
            },
        });

        return NextResponse.json({
            success: true,
            job: updatedJob,
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error updating job:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}

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
        const { jobId, tradepersonId } = await request.json();

        if (!jobId || !tradepersonId) {
            return NextResponse.json({
                success: false,
                message: 'Invalid job ID or tradeperson ID.',
            }, { status: 400 });
        }

        // Fetch the job
        const job = await prisma.jobs.findUnique({
            where: { id: jobId },
            select: { interestedTradepersons: true },
        });

        if (!job) {
            return NextResponse.json({
                success: false,
                message: 'Job not found.',
            }, { status: 404 });
        }

        // Check if the tradeperson ID is in the array
        const isInterested = job.interestedTradepersons.includes(tradepersonId);

        return NextResponse.json({
            success: true,
            isInterested,
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error checking tradeperson:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}

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
        // Parse the URL to get query parameters
        const url = new URL(request.url);
        const params = Object.fromEntries(url.searchParams.entries());
        const jobId = parseInt(params.jobId);

        if (!jobId) {
            return NextResponse.json({
                success: false,
                message: 'Invalid job ID.',
            }, { status: 400 });
        }

        // Fetch the job
        const job = await prisma.jobs.findUnique({
            where: { id: jobId },
            select: { interestedTradepersons: true },
        });

        if (!job) {
            return NextResponse.json({
                success: false,
                message: 'Job not found.',
            }, { status: 404 });
        }

        // Count the number of interested tradepersons
        const interestedCount = job.interestedTradepersons.length;

        return NextResponse.json({
            success: true,
            count: interestedCount,
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error fetching interested count:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}

export async function PATCH(request) {
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
        const { quoteId, isViewed } = await request.json();

        if (!quoteId) {
            return NextResponse.json({
                success: false,
                message: 'Quote ID is required.',
            }, { status: 400 });
        }

        // Update the 'isViewed' status of the quote
        const updatedQuote = await prisma.quotes.update({
            where: { id: quoteId },
            data: {
                isViewed: isViewed || true, // Defaults to true if not provided
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Quote status updated successfully.',
            quote: updatedQuote,
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error updating quote status:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}