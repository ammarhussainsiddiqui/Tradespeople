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
        const body = await request.json();
        const { id, understand } = body;

        // Validate input
        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'User ID is required.',
            }, { status: 400 });
        }

        // Find the user by ID
        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'User not found.',
            }, { status: 404 });
        }

        // Update the understand field
        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: { understand },
        });

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                roleId: updatedUser.roleId,
                understand: updatedUser.understand,
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
