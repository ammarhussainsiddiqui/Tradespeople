'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Envilop from '../../../assets/email.webp';
import { generateToken } from '../../../../utils/functions'
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
const Page = ({ searchParams }) => {
    const email = searchParams.email || null;
    const id = searchParams.id || null;
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        if (email) {
            sendEmail();
        }
    }, [email]);

    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendTimer]);

    const sendEmail = async () => {
        const token = await generateToken();
        try {
            const response = await fetch('/api/send-link-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ email, id }),
            });
            const data = await response.json();

            if (data.success) {
                setResendTimer(60); // Set 1-minute timer for resending
            } else {
                Sentry.captureException(data.message);
            }
        } catch (error) {
            Sentry.captureException('Failed to send email:', error);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;

        await sendEmail();
    };

    return (
        <div className="content max-w-7xl mx-auto w-screen px-4 sm:px-6 lg:px-8 bg-muted">
            <div className="flex flex-col items-center justify-center w-full p-2 md:p-8">
                <div className="bg-surface p-6 rounded-lg w-full max-w-md border border-neutral-200 text-center mb-2">
                    <Image className="mx-auto" width={64} height={64} src={Envilop} alt='envilop' />
                    <h2 className="text-2xl font-semibold">Check your email</h2>
                    <span className="flex flex-col text-sm text-muted-foreground">
                        <span>
                            The link has been sent to your email address
                        </span>

                    </span>
                    <span className='font-bold text-foreground border-b-2 border-accent'>
                        {email}
                    </span>
                    <br />
                    <div className='h-5'></div>
                    <span className="text-sm text-muted-foreground">
                        Didn’t receive the link?{' '}
                        <button
                            onClick={handleResend}
                            disabled={resendTimer > 0}
                            className="text-foreground "
                        >
                            {resendTimer > 0
                                ? `Resend in ${resendTimer}s`
                                : 'Resend'}
                        </button>
                    </span>
                    <br />
                    <span className="text-sm text-muted-foreground">

                        <Link
                            href={'/login'}
                            className="text-foreground border-accent border-b "
                        >
                            Take me to Login.
                        </Link>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Page;
