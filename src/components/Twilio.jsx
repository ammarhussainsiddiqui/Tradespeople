'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { isValidNumber, parsePhoneNumber } from 'libphonenumber-js';
import Image from 'next/image';
import CheckImage from './../app/assets/varified.webp';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "../components/ui/input-otp";

import Spinner from './Spinner'; // Custom Spinner component
import { getUserDetails } from '../actions/auth'
import * as Sentry from '@sentry/nextjs';

const Twilio = ({ userData }) => {
    const [counter, setCounter] = useState(60);
    const [OtpError, setOtpError] = useState('');
    const [otp, setOtp] = useState('');
    const [canResend, setCanResend] = useState(false);
    const [canVarify, setCanVarify] = useState(false);
    const [isVarify, setIsVarify] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');
    const [showPhoneDialog, setShowPhoneDialog] = useState(false);
    const [showOTPDialog, setShowOTPDialog] = useState(false);
    const [dialogError, setDialogError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resandLoading, setResandLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('gb');
    const otpSentRef = useRef(false);

    function isValidPhoneNumber(number, countryCode) {
        try {
            const phoneNumber = parsePhoneNumber(number, countryCode.toUpperCase());
            return phoneNumber.isValid();
        } catch (error) {
            return false;
        }
    }

    // Function to close the dialog
    const closeDialog = () => {
        setShowPhoneDialog(false);
        setShowOTPDialog(false);
        setDialogError('');
        setOtp('');
        setPhoneNumber('');
    };

    const sendOTP = async () => {
        setLoading(true);
        setResandLoading(true);
        const user = await getUserDetails();
        try {
            const response = await fetch('/api/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`,
                },
                body: JSON.stringify({ phoneNumber: `+${phoneNumber}` }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            setGeneratedCode(result.otp)
            setCanResend(false); // Disable resend button immediately
            setCounter(60); // Reset counter
            otpSentRef.current = true; // Mark OTP as sent
        } catch (error) {
            Sentry.captureException('Error sending OTP:', error);
            setOtpError('Error sending OTP. Please try again.');
        } finally {
            setLoading(false);
            setResandLoading(false);
        }
    }
    const verifyOtp = async () => {
        const jwt = await getUserDetails();
        try {
            const response = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt?.token}`,
                },
                body: JSON.stringify({ phoneNumber: `+${phoneNumber}`, otp }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            setOtpError('');
            return { status: 200 };
        } catch (error) {
            Sentry.captureException('Error verifying OTP:', error);
            setOtpError('Invalid OTP. Please try again.');
            return { status: 400 };
        }
    };
    // Function to handle phone number submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (phoneNumber == '' || phoneNumber == undefined) {
            setDialogError('Please Enter Phone Number.')
            return;
        } else if (!isValidPhoneNumber(phoneNumber, selectedCountry)) {
            setDialogError('Number is Not Valid.')
            return;
        } else {
            setDialogError('')
        }
        setLoading(true);
        setTimeout(async () => {
            await sendOTP();
            setLoading(false);
            openOTPModal(); // Close the dialog after sending otp
        }, 2000);
    };

    const openOTPModal = () => {
        setShowOTPDialog(true);
        setShowPhoneDialog(false);
    }


    const varifyPhone = async (otp) => {
        setLoading(true);
        const user = await getUserDetails();
        try {
            const verifyResponse = await verifyOtp(); // This should call your API
            setOtpError(''); // Clear any previous errors

            if (verifyResponse?.status === 200) {
                const response = await fetch('/api/update-number', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user?.token}`,
                    },
                    body: JSON.stringify({ userId: userData?.id, phoneNumber }),
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    setOtpError(result.message);
                } else {
                    setIsVarify(true);
                    setTimeout(() => {
                        window.location.reload();
                        setShowOTPDialog(false);
                    }, 2000);
                }
            } else {
                setOtpError('Invalid OTP. Please try again.');
            }

        } catch (error) {
            setOtpError(error.message);
        } finally {
            setLoading(false);
        }
    };


    // Resend OTP code
    const resendCode = useCallback(async () => {
        if (canResend) {
            await sendOTP();
            setOtp('');
            setCanResend(false); // Disable resend button immediately
            setCounter(60); // Reset counter
            setOtpError(''); // Clear previous errors
        }
    }, [canResend]);

    useEffect(() => {
        if (counter > 0) {
            const timer = setTimeout(() => setCounter(counter - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [counter]);

    useEffect(() => {
        if (otp.length === 6) {
            setCanVarify(true);
        } else {
            setCanVarify(false);
            setOtpError('');
        }
    }, [otp]);

    return (
        <>
            {/* Varified OTP Dialog */}
            <Dialog open={showOTPDialog} onOpenChange={closeDialog} className="relative z-60">
                <DialogContent className="max-w-md mt-[-150px] md:mt-0 rounded-lg p-6 shadow-lg">
                    <DialogHeader>
                        <div className="flex flex-col items-center">
                            {isVarify ?
                                <>
                                    <DialogTitle className="text-center font-semibold text-2xl">
                                        Phone Number Is Verified
                                    </DialogTitle>
                                    <Image className='h-full w-40' src={CheckImage} alt='varifide' />
                                    <DialogDescription className="text-sm text-center mt-2 text-muted-foreground">
                                        Successfully Verified Your Phone Number<br /> {'+' + phoneNumber}
                                    </DialogDescription>
                                </>
                                :
                                <>
                                    <DialogTitle className="text-center font-semibold text-2xl">
                                        OTP (One-Time Verification Password)
                                    </DialogTitle>
                                    <DialogDescription className="text-sm text-center mt-2 text-muted-foreground">
                                        Enter the 6-digit verification code sent to <br /> {'+' + phoneNumber}
                                    </DialogDescription>
                                    <div className="mt-4">
                                        <InputOTP id='otpInput' maxLength={6} value={otp} onChange={setOtp}>
                                            <InputOTPGroup>
                                                {[0, 1, 2].map((index) => (
                                                    <InputOTPSlot
                                                        key={index}
                                                        index={index}
                                                        onChange={(e) => {
                                                            const newOtp = otp.split('');
                                                            newOtp[index] = e.target.value;
                                                            setOtp(newOtp.join(''));
                                                        }}

                                                    />
                                                ))}
                                            </InputOTPGroup>
                                            <InputOTPSeparator />
                                            <InputOTPGroup>
                                                {[3, 4, 5].map((index) => (
                                                    <InputOTPSlot
                                                        key={index}
                                                        index={index}
                                                        onChange={(e) => {
                                                            const newOtp = otp.split('');
                                                            newOtp[index] = e.target.value;
                                                            setOtp(newOtp.join(''));
                                                        }}
                                                    />
                                                ))}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>
                                    {OtpError && <p className="text-destructive mt-2">{OtpError}</p>}
                                    <div className="w-full text-center mt-4 justifu-center item-center">
                                        {resandLoading ?
                                            <div style={{ marginLeft: 'auto', marginRight: 'auto' }} className=' w-full  text-center item-center'>
                                                <span
                                                    style={{ justifyContent: 'center' }}
                                                    className="flex text-xs text-center item-center text-muted-foreground font-normal ml-auto cursor-pointer"
                                                >
                                                    Didnâ€™t receive the code? <b>
                                                        <svg
                                                            style={{ marginTop: '2px', marginLeft: '10px' }}
                                                            className={`animate-spin h-3 w-3`}
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291l1.414 1.414C8.204 18.047 10.042 18 12 18v-4c-1.506 0-2.933.432-4.14 1.172L6 17.291z"
                                                            ></path>
                                                        </svg>
                                                    </b>
                                                </span>
                                            </div>
                                            :
                                            <>
                                                {OtpError ? '' :
                                                    <>
                                                        {canResend ? (
                                                            <span
                                                                className="text-xs text-center text-muted-foreground font-normal cursor-pointer"
                                                                onClick={resendCode}
                                                            >
                                                                Didnâ€™t receive the code? <b><u>Resend Code</u></b>
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-center text-muted-foreground font-normal">
                                                                Resend code in {counter} seconds
                                                            </span>
                                                        )}
                                                    </>
                                                }
                                            </>
                                        }
                                    </div>
                                    {OtpError ? '' :
                                        <>
                                            {canVarify ?
                                                <button
                                                    type="button"
                                                    onClick={() => varifyPhone(otp)}
                                                    className="mt-4 w-full bg-accent text-accent-foreground font-semibold py-3 rounded-md flex hover:bg-primary hover:text-ink-inverse justify-center items-center"
                                                    disabled={loading}
                                                >
                                                    {loading ? <Spinner className="w-5 h-5" /> : 'Verify'}
                                                </button>
                                                :
                                                ''}
                                        </>
                                    }
                                </>}
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            {/* Phone Number Dialog */}
            <Dialog open={showPhoneDialog} onOpenChange={closeDialog} className="relative z-60">
                <DialogContent className="max-w-md mt-[-150px] md:mt-0 rounded-lg p-6 shadow-lg">
                    <DialogHeader>
                        <div className="flex flex-col items-center">
                            <DialogTitle className="text-center font-semibold text-2xl">
                                Your number is safe with us.
                            </DialogTitle>
                            <DialogDescription className="text-sm text-center mt-2 text-muted-foreground">
                                Please provide a phone number that can receive text messages.
                            </DialogDescription>
                            <form onSubmit={handleSubmit} className="w-full mt-6">
                                <div className="relative">
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-ink-soft">
                                        Phone Number
                                    </label>
                                    <PhoneInput
                                        className='py-2 rounded-lg bg-[hsl(var(--surface-subtle))]'
                                        country={'gb'} // Default country set to the United Kingdom
                                        value={phoneNumber}
                                        onChange={(phone, country) => {
                                            setSelectedCountry(country.countryCode)
                                            setPhoneNumber(phone);
                                            setDialogError('');
                                        }}
                                        inputStyle={{
                                            width: '100%',
                                            paddingLeft: '45px',
                                            borderRadius: '8px',
                                            border: '1px solid hsl(var(--surface-subtle))',
                                            backgroundColor: 'hsl(var(--surface-subtle))',
                                            fontSize: '18px',
                                        }}
                                        containerStyle={{
                                            width: '100%',
                                        }}
                                        buttonStyle={{
                                            background: 'hsl(var(--surface-subtle))',
                                            border: '1px solid hsl(var(--surface-subtle))',
                                            backgroundColor: 'hsl(var(--surface-subtle))',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    {dialogError && (
                                        <p className="text-xs text-destructive mt-2">{dialogError}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="mt-6 w-full bg-accent text-accent-foreground font-semibold py-3 rounded-md flex justify-center items-center"
                                    disabled={loading}
                                >
                                    {loading ? <Spinner className="w-5 h-5" /> : 'Continue'}
                                </button>
                            </form>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            {/* Display the option to add a phone number if not already provided */}
            {!userData.phone ? (
                <div className="p-6 bg-neutral-100 rounded-lg flex flex-col md:flex-row md:justify-between">
                    <div className="mb-4 md:mb-0">
                        <p className="text-lg font-semibold">Please add your contact number if you would like to receive direct calls from the tradesperson you will select.</p>
                        <p className="text-sm text-neutral-600">We will also use your contact number to send text messages with instructions when there is a good fit for your your posted job.</p>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowPhoneDialog(true)} // Open the phone dialog
                            className="px-4 py-2 bg-accent mt-1 text-accent-foreground hover:bg-primary hover:text-ink-inverse font-semibold rounded-md shadow-sm hover:bg-primary"
                        >
                            Add a phone number
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-6 bg-neutral-100 rounded-lg flex flex-col md:flex-row md:justify-between">
                    <div className="mb-4 md:mb-0">
                        <p className="text-lg font-semibold">Your account is verified.</p>
                        <p className="text-sm text-neutral-600">Your phone number has been verified. If youâ€™d like to use a different number, please update it here.</p>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowPhoneDialog(true)} // Open the phone dialog
                            className="px-4 py-2 bg-accent mt-1 text-accent-foreground hover:bg-primary hover:text-ink-inverse font-semibold rounded-md shadow-sm hover:bg-primary"
                        >
                            Update Phone Number
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Twilio;
