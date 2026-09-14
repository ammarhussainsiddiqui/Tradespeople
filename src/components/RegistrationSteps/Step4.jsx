import React, { useState, useEffect } from 'react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../../components/ui/input-otp";
import { getUserDetails } from '../../actions/auth'
import * as Sentry from '@sentry/nextjs';

const Step4 = ({ data, handleChange }) => {
  const [counter, setCounter] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [counter]);

  useEffect(() => {
    // Send OTP when component mounts (or replace with a more appropriate trigger)
    const sendOtp = async () => {
      const jwt = await getUserDetails();
      try {
        const response = await fetch('/api/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt?.token}`,
          },
          body: JSON.stringify({ phone: data.phone }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);

      } catch (error) {
        Sentry.captureException('Error sending OTP:', error);
      }
    };

    sendOtp();
  }, [data.phone]);

  const resendCode = async () => {
    const jwt = await getUserDetails();
    if (canResend) {
      try {
        const response = await fetch('/api/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt?.token}`,
          },
          body: JSON.stringify({ phone: data.phone }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        setCounter(60);
        setCanResend(false);
        setError('');
      } catch (error) {
        Sentry.captureException('Error resending OTP:', error);
        setError('Error resending OTP. Please try again.');
      }
    }
  };

  const verifyOtp = async () => {
    const jwt = await getUserDetails();
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt?.token}`,
        },
        body: JSON.stringify({ phone: data.phone, otp }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setIsVerified(true);
      setError('');
    } catch (error) {
      Sentry.captureException('Error verifying OTP:', error);
      setError('Invalid OTP. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <label htmlFor="otp_verification" className="block text-xl font-semibold text-ink-soft text-center py-2">
        OTP (One-Time Verification Password)
        <br />
        <span className="text-xs text-muted-foreground font-normal">
          Enter the 6-digit verification code sent to {data?.phone}
        </span>
      </label>
      <div className="mt-4">
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            {[0, 1, 2].map(index => (
              <InputOTPSlot key={index} index={index} onChange={(e) => setOtp(prev => prev.substr(0, index) + e.target.value + prev.substr(index + 1))} />
            ))}
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            {[3, 4, 5].map(index => (
              <InputOTPSlot key={index} index={index} onChange={(e) => setOtp(prev => prev.substr(0, index) + e.target.value + prev.substr(index + 1))} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      <button
        onClick={verifyOtp}
        className="mt-4 px-4 py-2 bg-accent text-ink-inverse rounded-md font-semibold"
      >
        Verify OTP
      </button>
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
      {isVerified && <p className="text-success mt-4">OTP Verified Successfully!</p>}
    </div>
  );
};

export default Step4;
