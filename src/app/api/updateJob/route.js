import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';
const prisma = new PrismaClient();

// Update job completion status
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
        const { id, job } = await request.json();

        // Validate the input data
        if (!id || !job) {
            return NextResponse.json({
                success: false,
                message: 'Invalid input.',
            }, { status: 400 });
        }

        // Update the job's completion status
        const updatedJob = await prisma.jobs.update({
            where: { id: parseInt(id) },
            data: { job },
        });

        return NextResponse.json({
            success: true,
            job: updatedJob,
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error updating job status:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}
