
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
