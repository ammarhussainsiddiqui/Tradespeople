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
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: 'User ID is required.',
            }, { status: 400 });
        }

        const tradeLocations = await prisma.tradeLocation.findMany({
            where: {
                userId: parseInt(userId, 10),
            },
        });

        return NextResponse.json({
            success: true,
            tradeLocations,
        });
    } catch (error) {
        Sentry.captureException('Error fetching trade locations:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { postcode, distance, userId } = await request.json();

        if (!postcode || !userId) {
            return NextResponse.json({
                success: false,
                message: 'Postcode and User ID are required.',
            }, { status: 400 });
        }

        // Check if the postcode already exists for the user
        const existingTradeLocation = await prisma.tradeLocation.findFirst({
            where: {
                postcode,
                userId: parseInt(userId, 10),
            },
        });


        const existingPostCode = await prisma.user.findFirst({
            where: {
                postcode,
                id: parseInt(userId, 10),
            },
        });

        if (existingTradeLocation || existingPostCode) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'This location already exists.',
                },
                { status: 400 }
            );
        }


        const newTradeLocation = await prisma.tradeLocation.create({
            data: {
                postcode,
                distance: distance || null,
                userId: parseInt(userId, 10),
            },
        });

        return NextResponse.json({
            success: true,
            tradeLocation: newTradeLocation,
        }, { status: 201 });
    } catch (error) {
        Sentry.captureException('Error creating trade location:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'Trade location ID is required.',
            }, { status: 400 });
        }

        await prisma.tradeLocation.delete({
            where: {
                id: parseInt(id, 10),
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Trade location deleted successfully.',
        });
    } catch (error) {
        Sentry.captureException('Error deleting trade location:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}
export async function PUT(request) {
    try {
        const { postcode, userId } = await request.json();

        // Ensure both postcode and userId are provided
        if (!postcode || !userId) {
            return NextResponse.json({
                success: false,
                message: 'Postcode and User ID are required.',
            }, { status: 400 });
        }

        // Find the user by userId
        const existingUser = await prisma.user.findUnique({
            where: {
                id: parseInt(userId, 10),
            },
        });

        // Check if the user exists
        if (!existingUser) {
            return NextResponse.json({
                success: false,
                message: 'User not found.',
            }, { status: 404 });
        }

        // Update the user's postcode
        const updatedUser = await prisma.user.update({
            where: {
                id: parseInt(userId, 10),
            },
            data: {
                postcode: postcode, // Update the postcode
            },
        });

        return NextResponse.json({
            success: true,
            message: 'User postcode updated successfully.',
            user: updatedUser,
        }, { status: 200 });

    } catch (error) {
        // Log the error using Sentry
        Sentry.captureException('Error updating user postcode:', error);

        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}