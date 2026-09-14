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
        const { requestId } = await request.json();

        // Validate the request ID
        const parsedRequestId = parseInt(requestId, 10);
        if (isNaN(parsedRequestId)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid request ID.',
            }, { status: 400 });
        }

        // Fetch the request details 
        const requestDetails = await prisma.request.findUnique({
        //     where: { id: parsedRequestId },
        //     include: {
        //         job: true,
        //         // user: true, 
        //         // tradeperson: true, 
        //     },
        // });
        where: { id: parsedRequestId },
        include: {
            job: {
                select: {
                    id: true,
                    statusId: true, // Explicitly fetch the statusId
                },
            },
        },
    });


        if (!requestDetails) {
            return NextResponse.json({
                success: false,
                message: 'Request not found.',
            }, { status: 404 });
        }

        // Extract IDs
        const { job , tradepersonId} = requestDetails;
        // Return response
        return NextResponse.json({
            success: true,
            // data: 
            data: {
                
                requestId: parsedRequestId,
                jobId: job?.id || null,
                tradepersonId : tradepersonId || null,
                statusId: job?.statusId || null, // Include statusId here
            },
        }, { status: 200 });

    } catch (error) {
        Sentry.captureEvent('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}
