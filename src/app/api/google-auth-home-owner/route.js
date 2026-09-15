
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/nextjs';
import { verifyGoogleCredential } from '../../../lib/auth/google';

const prisma = new PrismaClient();

export async function POST(request) {

    try {
        // Identity comes from the Google ID token verified here, never from the
        // request body, so nobody can sign in as someone else by sending their email.
        const { credential } = await request.json();
        const googleUser = await verifyGoogleCredential(credential);
        if (!googleUser) {
            return NextResponse.json({
                success: false,
                message: 'Google sign-in could not be verified. Please try again.',
            }, { status: 401 });
        }
        const { email } = googleUser;

        // Check if the user already exists using Prisma
        const existingUser = await prisma.user.findUnique({
            where: { email: email },
        });

        if (existingUser) {
            // If user exists, return userId and password
            return NextResponse.json({
                success: true,
                message: 'User already exists',
                userId: existingUser.id,
                password: existingUser.password,  // Return the password for login
                email
            }, { status: 200 });
        }


         // If user doesn't exist, return a message that user doesn't exist
         return NextResponse.json({
            success: false,
            message: 'Please create an account to login.',
        }, { status: 404 });




    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.'
        }, { status: 500 });
    }
}
