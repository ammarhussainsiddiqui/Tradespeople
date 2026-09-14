'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../../components/ui/button";

const validateEmail = (email) => {
  // Basic regex for email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|yahoo\.com|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

  // Check if the email matches the regex pattern
  if (emailRegex.test(email)) {
    return { isValid: true, errorMessage: null };
  } else {
    return { isValid: false, errorMessage: "Invalid email address." };
  }
};


const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(null);

  useEffect(() => {
    if (email) {
      const { isValid, errorMessage } = validateEmail(email);
      setEmailError(isValid ? null : errorMessage);
    }
  }, [email]);

  const handleContinue = () => {
    if (!emailError && email) {
      router.push(`/login/forget-password/forget-pwd?email=${email}&id=5`)
      // Handle email submission logic here, e.g., sending to an API
    }
  };

  return (
    <div className="content max-w-7xl mx-auto w-screen px-4 sm:px-6 lg:px-8 bg-muted">
      <div className="flex flex-col items-center justify-center w-screen p-4">
        <div className="bg-surface p-6 rounded-lg border border-neutral-200 w-full max-w-md mb-4">
          <h2 className="md:text-2xl text-xl font-bold">Forgot Password</h2>
          <p className="mb-4 text-xs">Enter your email address for verification.</p>
          <form>
            <div>
              <label htmlFor="email" className="block text-ink-soft">
                Email <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full p-3 border rounded-md focus:outline-none focus:border-accent"
              />
              {emailError && <p className="text-destructive-soft-foreground">{emailError}</p>}
              <Button
                type="button"
                onClick={handleContinue}
                className="bgColor mt-4 w-full text-accent-foreground font-semibold py-2 px-4 rounded-lg hover:bg-primary hover:text-ink-inverse focus:outline-none"
              >
                Continue
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
