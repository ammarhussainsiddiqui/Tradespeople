import { EMAIL_THEME } from '../../../lib/theme/emailTheme';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';

export async function POST(request) {

    const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;
    const USER = process.env.NEXT_PUBLIC_NODEMAILER_USER;
    const PASS = process.env.NEXT_PUBLIC_NODEMAILER_PASS;
    
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
        const { email , code} = await request.json();

 
        // Configure nodemailer service
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // 'Gmail', 'Outlook'
            auth: {
                user: USER,
                pass: PASS,
            },
        });


        const mailOptions = {
            from: `${USER}`,
            to: email,
            subject: 'Your OTP Code',
            // text: `Your OTP is: ${code}`,
            html: `
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: ${EMAIL_THEME.shellBg}; padding: 20px; text-align: center; border-radius: 10px;">
                <div style="background-color: ${EMAIL_THEME.accent}; padding: 15px; border-radius: 10px;">
                </div>
                <div style="margin-top: 20px; padding: 20px; background-color: ${EMAIL_THEME.panelBg}; border-radius: 10px; border: 2px solid ${EMAIL_THEME.accent};">
                    <p style="font-size: 20px; color: ${EMAIL_THEME.accent}; margin: 0;">Your OTP Code</p>
                    <div style="margin: 10px 0; padding: 10px; border-radius: 5px; background-color: ${EMAIL_THEME.shellBg}; display: inline-block;">
                    <p style="font-size: 32px; font-weight: bold; color: ${EMAIL_THEME.accent}; letter-spacing: 5px;">${code}</p>
                    </div>
                    <p style="font-size: 16px; color: ${EMAIL_THEME.text}; margin-top: 20px;">Enter this code to verify your account.</p>
                    <p style="font-size: 14px; color: ${EMAIL_THEME.mutedText}; margin-top: 10px;">If you didn't request this code, please disregard this email.</p>
                </div>
                <div style="margin-top: 30px; padding: 10px; border-top: 1px solid ${EMAIL_THEME.accent};">
                    <p style="font-size: 12px; color: ${EMAIL_THEME.mutedText};">© 2024. All rights reserved.</p>
                    <p style="font-size: 12px; color: ${EMAIL_THEME.mutedText};">Visit us at <a href="https://thetradecore.com" style="color: ${EMAIL_THEME.accent}; text-decoration: none;">thetradecore.com</a></p>
                </div>
                </div>
                `,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        return NextResponse.json({
            success: true,
            message: 'Verification email sent successfully.',
        }, { status: 200 });
    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to send email.',
        }, { status: 500 });
    }
}
