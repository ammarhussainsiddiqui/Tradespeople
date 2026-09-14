import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import otpGenerator from 'otp-generator';
import twilio from 'twilio';
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';

const prisma = new PrismaClient();
const accountSid = process.env.NEXT_PUBLIC_ACC_SID; // SID
const authToken = process.env.NEXT_PUBLIC_ACC_AUTH; // Twilio auth token
const twilioNumber = process.env.NEXT_PUBLIC_ACC_NUMBER; 

const client = new twilio(accountSid, authToken);

const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/; // E.164 format regex
    return phoneRegex.test(phoneNumber);
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
        const { phoneNumber } = await request.json();

        // Validate phone number
        if (!validatePhoneNumber(phoneNumber)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid phone number format.',
            }, { status: 400 });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        // otpGenerator.generate(6, { digits: true });

        // Save OTP to database with phoneNumber (for verification later)
        await prisma.oTP.upsert({
            where: { phoneNumber },
            update: { otp, createdAt: new Date() },
            create: { phoneNumber, otp, createdAt: new Date() },
        });

        // Send OTP via SMS
        await client.messages.create({
            body: `Your OTP code is ${otp}`,
            messagingServiceSid: "MG568f29d5518dbee48ab094372c71d86b", // twilioNumber
            to: phoneNumber
        });

        return NextResponse.json({
            success: true,
            message: 'OTP sent successfully.',
        }, { status: 200 });
    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to send OTP.',
            reason: error.message
        }, { status: 500 });
    }
}
