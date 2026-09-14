import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';

const prisma = new PrismaClient();

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://thetradecore.com',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, ngrok-skip-browser-warning',
};
export async function GET() {
    
    try {
        // Fetch all services from the database
        const services = await prisma.mainTradeService.findMany();
        return NextResponse.json({
            success: true,
            services,
        }, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': 'https://thetradecore.com',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, ngrok-skip-browser-warning',
            },
        });
    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, {
            status: 500,
            headers: {
                'Access-Control-Allow-Origin': 'https://thetradecore.com',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, ngrok-skip-browser-warning',
            },
        });
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
        const { type } = await request.json();

        // Create a new service in the database
        const newService = await prisma.mainTradeService.create({
            data: {
                type,
            },
        });

        return NextResponse.json({
            success: true,
            service: newService,
        }, { status: 201 });
    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}

export async function DELETE(request) {
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
        const id = parseInt(params.id, 10); // Convert id to integer

        if (isNaN(id)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid service ID.',
            }, { status: 400 });
        }

        // Delete the service by ID
        const deletedService = await prisma.mainTradeService.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Main Service deleted successfully.',
            service: deletedService,
        }, { status: 200 });
    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204, // No content
    headers: corsHeaders,
  });
}