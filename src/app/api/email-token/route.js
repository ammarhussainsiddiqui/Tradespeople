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

        // Prepare user data
        let data = {};
        let user = {};

        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            // User exists, use existing data
            data.understand = existingUser.understand;
            user = existingUser;
        } else {
            // Create a new user if not found
            const newUser = await prisma.user.create({
                data: {
                    name: 'unknown',
                    email: email,
                    roleId: id,
                    password: '00000',
                },
            });
            user = newUser;
        }

        // Set the response data and cookies
        data = {
            id: user.id,
            name: user.name,
            email: user.email,
            token: updatedToken,
            roleId: user.roleId,
        };

        cookies().set('user', JSON.stringify(data), cookieConfig);
        cookies().set('jwt', updatedToken, cookieConfig);

        return NextResponse.json({
            success: true,
            role: userRole,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                roleId: user.roleId,
            },
            understand: data.understand,
            message: 'Token validated and updated successfully.',
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to validate token.',
        }, { status: 500 });
    }
}
