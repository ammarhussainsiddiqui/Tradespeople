import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';


const prisma = new PrismaClient();

// Fetch service data based on service ID
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
        const url = new URL(request.url);
        const params = Object.fromEntries(url.searchParams.entries());
        const serviceId = parseInt(params.serviceId, 10);

        // Validate service ID
        if (isNaN(serviceId)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid service ID.',
            }, { status: 400 });
        }

        // Fetch service data
        const service = await prisma.service.findUnique({
            where: {
                id: serviceId,
            },
            include: {
                questions: true, // Assuming you want to include related questions
                mainTrade: true,
            },
        });

        if (!service) {
            return NextResponse.json({
                success: false,
                message: 'Service not found.',
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            service,
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}
