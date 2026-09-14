import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';
const prisma = new PrismaClient();

export async function POST(request) {
    try {
        // Extract Authorization token from header
        const authHeader = request.headers.get('authorization');
        const token = authHeader && authHeader.split(' ')[1];
        
        // Authenticate user
        const authResult = await authenticateToken(token);
        if (authResult.error) {
            return NextResponse.json({
                success: false,
                message: authResult.error,
            }, { status: authResult.status });
        }

        // Parse the request body
        const { userId, phoneNumber } = await request.json();
        
        // Validate input
        if (!userId || !phoneNumber) {
            return NextResponse.json({
                success: false,
                message: 'Both userId and phoneNumber are required.',
            }, { status: 400 });
        }

        // Ensure userId is a valid integer
        const parsedUserId = parseInt(userId, 10);
        if (isNaN(parsedUserId)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid userId format.',
            }, { status: 400 });
        }

        // Check if the user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: parsedUserId },
        });

        if (!existingUser) {
            return NextResponse.json({
                success: false,
                message: 'User not found.',
            }, { status: 404 });
        }

        // Check if the phone number is already in use by another user
        // const existingNumber = await prisma.user.findFirst({
        //     where: { phone: `+${phoneNumber}` },
        // });

        // if (existingNumber) {
        //     return NextResponse.json({
        //         success: false,
        //         message: 'Phone number is already in use.',
        //     }, { status: 409 }); // Conflict status for duplicate resource
        // }

        // Update the user's phone number
        const updatedUser = await prisma.user.update({
            where: { id: parsedUserId },
            data: { phone: `+${phoneNumber}` },
        });

        // Return a success response with updated user data
        return NextResponse.json({
            success: true,
            message: 'Phone number updated successfully.',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                roleId: updatedUser.roleId,
            },
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error:', error);

        // Handle unexpected server errors
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
        const { userId, phoneNumber } = await request.json();

        // Validate input
        if (!userId || !phoneNumber) {
            return NextResponse.json({
                success: false,
                message: 'Both userId and phoneNumber are required.',
            }, { status: 400 });
        }

        // Check if the user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: parseInt(userId) }, // Ensure userId is an integer
        });

        if (!existingUser) {
            return NextResponse.json({
                success: false,
                message: 'User not found.',
            }, { status: 404 });
        }

        // Update the user's roleId
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { phone: `+${phoneNumber}` }, 
        });

        return NextResponse.json({
            success: true,
            message: 'phone number updated successfully.',
            userID: updatedUser.id,
            password: updatedUser.password,
            exist : true,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                roleId: updatedUser.roleId,
            },
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}
