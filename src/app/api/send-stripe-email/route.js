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
        const { email , packageType } = await request.json();

 
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
            subject: `Welcome!`,
            html: `
              <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: ${EMAIL_THEME.shellBg}; padding: 20px; text-align: center; border-radius: 10px;">
                <div style="background-color: ${EMAIL_THEME.accent}; padding: 15px; border-radius: 10px;">
                </div>
                <div style="margin-top: 20px; padding: 20px; background-color: ${EMAIL_THEME.panelBg}; border-radius: 10px; border: 2px solid ${EMAIL_THEME.accent};">
                    <h2 style="font-size: 24px; color: ${EMAIL_THEME.accent}; margin: 0;">Welcome to the ${packageType} Package!</h2>
                    <p style="font-size: 18px; color: ${EMAIL_THEME.text}; margin-top: 10px;">
                        We're excited to have you with us. As a ${packageType} member, you now have access to exclusive features designed to enhance your trading experience.
                    </p>
                    <p style="font-size: 16px; color: ${EMAIL_THEME.accent}; margin-top: 20px;">Login to Your Account</p>
                    <div style="margin: 20px 0;">
                        <a href="${verificationLink}" style="background-color: ${EMAIL_THEME.accent}; color: ${EMAIL_THEME.accentText}; padding: 15px 25px; text-decoration: none; font-size: 18px; font-weight: bold; border-radius: 5px; display: inline-block;">Login</a>
                    </div>
                    <p style="font-size: 16px; color: ${EMAIL_THEME.text}; margin-top: 20px;">Click the button above to access your account and start exploring your new benefits.</p>
                    <p style="font-size: 14px; color: ${EMAIL_THEME.mutedText}; margin-top: 10px;">If you didn't request this verification, please ignore this email.</p>
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
