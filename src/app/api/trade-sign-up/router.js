import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
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
        const { name, username, email, password, confirmPassword } = await request.json();

        // Validate input
        if (password !== confirmPassword) {
            return NextResponse.json({ success: false, message: 'Passwords do not match.' }, { status: 400 });
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ success: false, message: 'Invalid email format.' }, { status: 400 });
        }

        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return NextResponse.json({ success: false, message: 'User already exists.' }, { status: 400 });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = await prisma.user.create({
            data: {
                name,
                username,
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json({ success: true, message: 'User registered successfully', userId: newUser.id }, { status: 200 });
    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
    }
}
