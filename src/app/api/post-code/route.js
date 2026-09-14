import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';

const prisma = new PrismaClient();

export async function GET() {
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
        // Fetch all services from the database
        const services = await prisma.postCode.findMany();
        return NextResponse.json({
            success: true,
            services,
        }, { status: 200 });
    } catch (error) {
        Sentry.captureException('Error:', error);
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
        const { code , area } = await request.json();

        // Create a new service in the database
        const newService = await prisma.postCode.create({
            data: {
                code: code,
                area: area
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
        const deletedService = await prisma.postCode.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Service deleted successfully.',
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
