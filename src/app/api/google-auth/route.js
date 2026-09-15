
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
        const { email, firstName, lastName, profilePicture } = googleUser;

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

        // If user doesn't exist, create a new user with a default password

        const newUser = await prisma.user.create({
            data: {
                name:'unknown',
                firstName: firstName,
                lastName: lastName,
                postcode: 'Bromley',
                roleId: 1,
                password: '$2a$10$Zym6wSY5y2v.3JUMdBIKK.DhLWKjeTeggCXYHj0lMahWDx7av/tr6',
                email: email,
                profileUrl: profilePicture
            },
        });

        return NextResponse.json({
            success: true,
            message: 'User registered successfully',
            userId: newUser.id,
            password: newUser.password, // Return the password for login
            email
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.'
        }, { status: 500 });
    }
}
