
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';

const prisma = new PrismaClient();

export async function POST(request) {
    
    try {
        // Parse the email from the request body
        const { email, firstName, lastName, profilePicture  } = await request.json();
        if (!email) {
            return NextResponse.json({
                success: false,
                message: 'Email is required.',
            }, { status: 400 });
        }

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
