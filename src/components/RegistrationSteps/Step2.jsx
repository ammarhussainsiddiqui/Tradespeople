"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../../components/ui/input-otp";
import { getUserDetails } from '../../actions/auth'
import { generateToken } from '../../utils/functions'
import * as Sentry from '@sentry/nextjs';
// Utility function to generate a random OTP code
const generateOtpCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const Step2 = ({ data, handleEmailVerification }) => {
  const [counter, setCounter] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otp, setOtp] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false); // New state to track verification status
  const otpSentRef = useRef(false); // Ensures OTP is only sent once

  // Function to send OTP email
  const sendOtpEmail = useCallback(async (otpCode) => {
    const token = await generateToken();
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email: data.email, code: otpCode }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      otpSentRef.current = true; // Mark email as sent
    } catch (error) {
      Sentry.captureException('Error sending OTP:', error);
      setError('Error sending OTP. Please try again.');
    }
  }, [data.email]);

  useEffect(() => {
    if (!otpSentRef.current) {
      const otpCode = generateOtpCode();
      setCode(otpCode);
      sendOtpEmail(otpCode);
    }
  }, [sendOtpEmail]);

  // Handle countdown timer
  useEffect(() => {
    if (counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [counter]);

  // Resend OTP code
  const resendCode = useCallback(async () => {
    if (canResend) {
      setOtp('');
      setCanResend(false); // Disable resend button immediately
      setCounter(60); // Reset counter
      setError(''); // Clear previous errors
      const otpCode = generateOtpCode();
      setCode(otpCode);
      await sendOtpEmail(otpCode);
    }
  }, [canResend, sendOtpEmail]);

  // Verify OTP code
  useEffect(() => {
    if (otp.length === 6 && !isVerified) {
      if (code === otp) {
        handleEmailVerification(true); // Notify parent component of successful verification
        setIsVerified(true); // Update verification status
        setError(''); // Clear any previous errors
      } else {
        setError('Invalid OTP. Please try again.');
      }
    }
  }, [otp, code, handleEmailVerification, isVerified]);

  // Disable input slots if OTP is verified
  const isInputDisabled = isVerified;

  return (
    <div className="flex flex-col items-center">
      <label
        htmlFor="otp_verification"
        className="block text-md font-semibold text-ink-soft text-center py-2"
      >
        Enter the 6-digit verification code we have sent to your email address.
      </label>
      <div className="mt-4">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
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
                disabled={isInputDisabled} // Disable all inputs if verified
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
                disabled={isInputDisabled} // Disable all inputs if verified
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      {error && <p className="text-destructive mt-2">{error}</p>}
      <div className="w-full text-center mt-4">
        {canResend ? (
          <span
            className="text-xs text-center text-muted-foreground font-normal cursor-pointer"
            onClick={resendCode}
          >
            Didn’t receive the code? <b><u>Resend Code</u></b>
          </span>
        ) : (
          <span className="text-xs text-center text-muted-foreground font-normal">
            Resend code in {counter} seconds
          </span>
        )}
      </div>
    </div>
  );
};

export default Step2;
