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
        const { phoneNumber, otp } = await request.json();
        // Fetch OTP from database
        const record = await prisma.oTP.findUnique({
            where: { phoneNumber },
        });

        if (record && record.otp === otp) {
            // Check if OTP is expired (e.g., 5 minutes validity)
            const otpAge = new Date() - new Date(record.createdAt);
            if (otpAge > 5 * 60 * 1000) {
                return NextResponse.json({
                    success: false,
                    message: 'OTP expired.',
                }, { status: 400 });
            }

            // OTP valid
            return NextResponse.json({
                success: true,
                message: 'OTP verified successfully.',
            }, { status: 200 });
        } else {
            return NextResponse.json({
                success: false,
                message: 'Invalid OTP.',
            }, { status: 400 });
        }
    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}
