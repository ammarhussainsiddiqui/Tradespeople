import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../../authenticateToken';
import { getSignedUrlFromS3 } from '../../../utils/imageUploads';
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
        const { id } = await request.json(); 

        // Validate the ID (assuming it's an integer)
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid user ID.',
            }, { status: 400 });
        }

        // Find the user by ID using Prisma
        const user = await prisma.user.findUnique({
            where: { id: userId },
            // include: {SubscriptionType:true,tradepersonDetails:true}
            include: {
                SubscriptionType:true,
                Subscription:true,
                tradepersonDetails: true,
                tradeService: {
                  include: {
                    Service: true,
                  },
                },
                tradeLocation: true,
              },
        });


        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'User not found.',
            }, { status: 404 });
        }

        // const signedImageUrl = await getSignedUrlFromS3(user?.profileUrl);
        // user.profileUrl = signedImageUrl;
        // Send response with user data
        return NextResponse.json({
            success: true,
            user, 
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}

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
        const { id } = await request.json();

        // Validate the ID
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid user ID.',
            }, { status: 400 });
        }

        // Find the user by ID and update leadUsed
        const user = await prisma.user.update({
            where: { id: userId },
            data: { leadUsed: { increment: 1 }, remaningLeads: { decrement: 1 } }, // Increment leadUsed by 1
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'User not found.',
            }, { status: 404 });
        }

        // Send response with updated user data
        return NextResponse.json({
            success: true,
            message: 'Lead used updated successfully.',
            user, 
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error:', error);
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
        const { id } = await request.json();

        // Validate the ID
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid user ID.',
            }, { status: 400 });
        }

        // Find the user by ID and reset leadUsed to 0
        const user = await prisma.user.update({
            where: { id: userId },
            data: { leadUsed: 0 , remaningLeads: 3}, // Reset leadUsed to 0
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'User not found.',
            }, { status: 404 });
        }

        // Send response with updated user data
        return NextResponse.json({
            success: true,
            message: 'Lead used reset to 0 successfully.',
            user,
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}
