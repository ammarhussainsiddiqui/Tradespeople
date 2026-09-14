'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../../components/ui/button";
import { EyeIcon, EyeOff } from 'lucide-react';
import { generateToken } from '../../../../utils/functions'
import * as Sentry from '@sentry/nextjs';
const cacheName = 'pwd-cache';

import { useGlobalState } from '../../../../app/context/GlobalStateContext';


const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { pwdCache, setpwdCache } = useGlobalState();
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleContinue = async () => {
    const token = await generateToken();
    if (password && confirmPassword && password === confirmPassword) {

      let newPassword = password;
      setError('');
      setIsLoading(true);
      try {
        const response = await fetch('/api/bliend-reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ email, newPassword }),
        });
        const data = await response.json();

        if (data.success) {
          router.push('/login'); // Redirect to login page after successful password reset
        } else {
          setError(data.message || "Error resetting password.");
        }
      } catch (error) {
        Sentry.captureException(error);
        setError("Unable to set new password.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("Passwords do not match");
    }
  };

  useEffect(() => {
    const fetchEmail = async () => {
      const cachedEmail = pwdCache;
      if (cachedEmail) {
        setEmail(cachedEmail);
      }
    };

    fetchEmail();
  }, [email]);

  return (
    <div className="content max-w-7xl mx-auto w-screen px-4 sm:px-6 lg:px-8 bg-muted">
      <div className="flex flex-col items-center justify-center w-screen p-4">
        {email == '' || email == null || email == undefined ?
          <div className="bg-surface p-6 rounded-lg text-center border border-neutral-200 w-full max-w-md mb-4">
            <h2 className="md:text-2xl text-destructive-soft-foreground text-xl font-bold">Unauthorized link</h2>
            <p className="mb-4 text-xs">Use the same browser.</p>

          </div>
          :
          <div className="bg-surface p-6 rounded-lg border border-neutral-200 w-full max-w-md mb-4">
            <h2 className="md:text-2xl text-xl font-bold">New Password</h2>
            <p className="mb-4 text-xs">Create a new password and remember it.</p>
            <form>
              <div>
                <label className="block text-ink-soft">
                  Password <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full p-3 border rounded-md focus:outline-none focus:border-accent"
                  />
                  <span
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground cursor-pointer"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-6 w-6" />
                    ) : (
                      <EyeIcon className="h-6 w-6" />
                    )}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-ink-soft">
                  Confirm Password <span className="text-destructive">*</span>
                </label>
                <input
                  type="password"
                  name="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full p-3 border rounded-md focus:outline-none focus:border-accent"
                />
              </div>
              {errorMessage && <p className="text-destructive-soft-foreground">{errorMessage}</p>}
              <Button
                type="button"
                onClick={handleContinue}
                className="bgColor mt-4 w-full text-accent-foreground font-semibold py-2 px-4 rounded-lg hover:bg-primary hover:text-ink-inverse focus:outline-none"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true">Loading...</span>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>
          </div>
        }
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
