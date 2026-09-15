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
        const { email, newPassword } = await request.json();

        // Check if user exists 
        const user = await prisma.user.findUnique({
            where: { email: email },
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'User not found.',
            }, { status: 404 });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user with new password
        await prisma.user.update({
            where: { email: email },
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
        Sentry.captureException('Error:', error.message);
        return NextResponse.json({
            success: false,
            message: `Internal server error: ${error.message}`, // Include error message in the response
        }, { status: 500 });
    }
}
