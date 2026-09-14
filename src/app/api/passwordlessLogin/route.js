import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;

const cookieConfig = {
    httpOnly: true,
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
};

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
        const { token, email, id } = await request.json();

        // Verify the JWT token
        const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));

        // Define the new token's expiry and role
        const expiry = Math.floor(Date.now() / 1000) + (60 * 60 * 24); // 1 day from now
        const userRole = id;

        // Create a new JWT token with updated expiry and role
        const updatedToken = await new SignJWT({ ...payload, exp: expiry, role: userRole })
            .setProtectedHeader({ alg: 'HS256' })
            .sign(new TextEncoder().encode(JWT_SECRET));

        const existingUser = await prisma.user.findUnique({
            where: { email },
            include: {SubscriptionType:true}
        });

        if (!existingUser) {
            return NextResponse.json({
                success: false,
                message: 'User not found. Please sign up.',
            }, { status: 500 });
        } else {
            return NextResponse.json({
                success: true,
                role: userRole,
                user: existingUser,
                message: 'Token validated successfully.',
            }, { status: 200 });
        }

      

    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to validate token.',
        }, { status: 500 });
    }
}
