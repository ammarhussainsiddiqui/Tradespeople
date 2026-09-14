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
        const { id } = await request.json();

        // Validate the ID (assuming it's an integer)
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid user ID.',
            }, { status: 400 });
        }

        // Find the user by ID excluding tradeperson-related details
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                profileUrl: true,
                firstName: true,
                lastName: true,
                name: true,
                phone:true,
                email:true,
                
                introduction: true,
                postcode: true,
                
                
                
                createdAt: true,
              
            },
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'User not found.',
            }, { status: 404 });
        }

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
