import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';

const prisma = new PrismaClient();
const JWT_SECRET = (process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET);

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
        const { userId, currentPassword, newPassword } = await request.json();

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'User not found.',
            }, { status: 404 });
        }

        // Validate current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({
                success: false,
                message: 'Incorrect current password.',
            }, { status: 401 });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user with new password
        await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { password: hashedPassword },
        });

        // Generate new JWT
        const token = jwt.sign(
            { userId: user.id, role: user.roleId },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send response
        return NextResponse.json({
            success: true,
            message: 'Password changed successfully.',
            token,
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}
