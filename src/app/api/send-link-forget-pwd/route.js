import { EMAIL_THEME } from '../../../lib/theme/emailTheme';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';

export async function POST(request) {

    const JWT_SECRET = (process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET);
    const USER = process.env.NEXT_PUBLIC_NODEMAILER_USER;
    const PASS = (process.env.NODEMAILER_PASS || process.env.NEXT_PUBLIC_NODEMAILER_PASS);

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
        const { email , id} = await request.json();

        const token = jwt.sign(
            { email: email, role: id },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const verificationLink = `${process.env.NEXT_PUBLIC_URL}/login/verify-email?token=${token}&email=${encodeURIComponent(email)}&id=${id}`;

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
            subject: 'Reset Your Password',
            html: `
              <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: ${EMAIL_THEME.shellBg}; padding: 20px; text-align: center; border-radius: 10px;">
                <div style="background-color: ${EMAIL_THEME.accent}; padding: 15px; border-radius: 10px;">
                </div>
                <div style="margin-top: 20px; padding: 20px; background-color: ${EMAIL_THEME.panelBg}; border-radius: 10px; border: 2px solid ${EMAIL_THEME.accent};">
                  <p style="font-size: 20px; color: ${EMAIL_THEME.accent}; margin: 0;">Reset Your Password</p>
                  <div style="margin: 20px 0;">
                    <a href="${verificationLink}" style="background-color: ${EMAIL_THEME.accent}; color: ${EMAIL_THEME.accentText}; padding: 15px 25px; text-decoration: none; font-size: 18px; font-weight: bold; border-radius: 5px; display: inline-block;">Reset Password</a>
                  </div>
                  <p style="font-size: 16px; color: ${EMAIL_THEME.text}; margin-top: 20px;">Click the button above to reset your password.</p>
                  <p style="font-size: 14px; color: ${EMAIL_THEME.mutedText}; margin-top: 10px;">If you did not request a password reset, please ignore this email or contact support if you have any concerns.</p>
                </div>
                <div style="margin-top: 30px; padding: 10px; border-top: 1px solid ${EMAIL_THEME.accent};">
                  <p style="font-size: 12px; color: ${EMAIL_THEME.mutedText};">© 2024. All rights reserved.</p>
                  <p style="font-size: 12px; color: ${EMAIL_THEME.mutedText};">Visit us at <a href="#" style="color: ${EMAIL_THEME.accent}; text-decoration: none;">tradepeople.co.uk</a></p>
                </div>
              </div>
            `,
          };
          

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log('[send-link-forget-pwd] sendMail response:', {
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
            response: info.response,
        });

        if (!info.accepted || !info.accepted.includes(email)) {
            console.error('[send-link-forget-pwd] recipient not accepted by SMTP server:', {
                email,
                rejected: info.rejected,
                response: info.response,
            });
            Sentry.captureMessage(`Password reset email not accepted for ${email}: ${info.response}`);

            return NextResponse.json({
                success: false,
                message: 'Failed to send email.',
            }, { status: 502 });
        }

        return NextResponse.json({
            success: true,
            message: 'Verification email sent successfully.',
        }, { status: 200 });
    } catch (error) {
        console.error('[send-link-forget-pwd] error sending email:', error);
        Sentry.captureException(error);
        return NextResponse.json({
            success: false,
            message: 'Failed to send email.',
        }, { status: 500 });
    }
}
