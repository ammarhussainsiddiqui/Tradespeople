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
      
        const emailSubscription = await prisma.email_Subscribe.findMany();

        if (!emailSubscription) {
            return NextResponse.json({
                success: false,
                message: 'No subscription found.',
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            emailSubscription,
        });
    } catch (error) {
        Sentry.captureException('Error fetching subscription:', error);
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
        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({
                success: false,
                message: 'Valid email is required.',
            }, { status: 400 });
        }

        // Check if email already exists
        const existingSubscription = await prisma.email_Subscribe.findUnique({
            where: { email },
        });

        if (existingSubscription) {
            return NextResponse.json({
                success: false,
                message: 'Email is already subscribed.',
            }, { status: 409 });
        }

        // Create a new subscription
        const newSubscription = await prisma.email_Subscribe.create({
            data: { email },
        });

        return NextResponse.json({
            success: true,
            emailSubscription: newSubscription,
            message: 'Successfully subscribed!',
        }, { status: 201 });
    } catch (error) {
        Sentry.captureException('Error creating subscription:', error);
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
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({
                success: false,
                message: 'Email is required.',
            }, { status: 400 });
        }

        // Delete the subscription
        await prisma.email_Subscribe.delete({
            where: { email },
        });

        return NextResponse.json({
            success: true,
            message: 'Subscription deleted successfully.',
        });
    } catch (error) {
        Sentry.captureException('Error deleting subscription:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}
