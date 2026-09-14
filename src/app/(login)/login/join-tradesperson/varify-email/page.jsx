"use client";
import React, { useState, useEffect } from 'react';
import Progress from '../../../../../components/Progress';
import Step2 from '../../../../../components/RegistrationSteps/Step2';
import { useRouter } from 'next/navigation';
import Spinner from '../../../../../components/Spinner';
import { login } from '../../../../../actions/auth';
import Link from 'next/link';
import { useFormState } from "react-dom";
import { generateToken } from '../../../../../utils/functions'
import { toast } from 'react-toastify';
import * as Sentry from '@sentry/nextjs';


import { useGlobalState } from '../../../../context/GlobalStateContext';
const Page = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null);
  const [emailValid, setEmailValid] = useState(false);
  const { userId, setUserId } = useGlobalState();

  const totalSteps = 1;

  // Initialize form state with login action
  const [currentState, loginAction, isPending] = useFormState(login, {});


  const [formData, setFormData] = useState({
    distance: "",
    tradeId: "",
    postcode: "",
    email: "",
    emailVarified: false,
  });


  // Load and validate form data from query parameters
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const email = query.get('email');

    if (email) {
      setFormData(prevData => ({
        ...prevData,
        distance: query.get('distance'),
        tradeId: query.get('trade'),
        postcode: query.get('postcode'),
        email: email,
        emailVarified: false,
      }));
      setEmailValid(true);
    } else {
      setErrorMessage('Email is required.');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleEmailVerification = (isVerified) => {
    setFormData(prevData => ({
      ...prevData,
      emailVarified: isVerified
    }));
  };

  useEffect(() => {
    if (formData.emailVarified && currentStep === totalSteps) {
      handleSubmit();
    }
  }, [formData.emailVarified, currentStep]);

  const handleSubmit = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    const token = await generateToken();


    try {
      const signupResponse = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        cache: "no-cache",
        body: JSON.stringify({
          name: "unknown",
          email: formData.email,
          password: "00000",
          roleId: 2,
          trade: formData.tradeId,
          postcode: formData.postcode,
          distance: formData.distance,
        }),
      });

      const signupResult = await signupResponse.json();

      ///////////////////

      ////update user roleID == 2

      ///////////////////

      if (signupResult.userID) {
        const updateResponse = await fetch('/api/signup', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          cache: "no-cache",
          body: JSON.stringify({ userId: signupResult.userID, roleId: 2 }),
        });

        const ResultUpdate = await updateResponse.json();
        if (ResultUpdate) {

          setResult(signupResult);
          setUserId(signupResult?.userID)
          const formDataEntries = new FormData();
          formDataEntries.append("email", formData.email);
          formDataEntries.append("password", signupResult.password || '00000');
          formDataEntries.append("roleId", 2);
          const response = await loginAction(formDataEntries);
          if (response?.zod_errors) {
            setErrorMessage('Validation errors occurred');
          } else if (response?.other) {
            setErrorMessage(response.other);
          } else {
          }

        }


      } else {
        setErrorMessage(signupResult.message || 'Conflict during signup. Please check the details.');
      }
    } catch (error) {
      Sentry.captureException('Error during form submission:', error);
      setErrorMessage('Error during form submission. Please try again.');
    } finally {
    }
  };

  const handleStepChange = (step) => {
    if (step === totalSteps && !formData.emailVarified) {
      setErrorMessage('Please verify your email before submitting.');
      return;
    }
    setCurrentStep(prev => Math.max(1, Math.min(prev + step, totalSteps)));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (currentStep === totalSteps) {
        if (formData.emailVarified) {
          handleSubmit();
        }
      } else {
        if (formData.email) {
          handleStepChange(1);
        } else {
          setErrorMessage('Please fill the required fields.');
        }
      }
    }
  };

  return (
    <div className="content max-w-7xl mx-auto w-screen px-4 sm:px-6 lg:px-8 bg-muted">
      <div className="w-screen" onKeyDown={handleKeyDown} tabIndex={0}>
        <div className="flex justify-between">
          <h2 className="mt-4 text-2xl font-semibold text-ink-soft">Complete your registration</h2>
          <p className="mt-5 text-sm text-muted-foreground">Step {currentStep}/{totalSteps}</p>
        </div>
        <div className="mt-4">
          <Progress currentStep={currentStep} totalSteps={totalSteps} />
        </div>
        <div className="max-h-96 h-screen mt-4 flex flex-col items-center justify-center">
          <div className="w-full max-w-md px-8 py-6 bg-surface rounded-lg shadow-md border border-neutral-200">
            {emailValid ? (
              <Step2 data={formData} handleChange={handleChange} handleEmailVerification={handleEmailVerification} />
            ) : (
              <p className="text-destructive text-center">Invalid or missing email address.</p>
            )}
          </div>
        </div>
        {errorMessage && <p className="text-destructive text-center mt-2">{errorMessage}</p>}
        {result && <p className="text-destructive text-center mt-2">{result?.message}</p>}
        <div className="mt-4 mb-4 flex justify-between">
          {currentStep === 1 ? (
            <Link
              href='/login/join-tradesperson'
              className="px-4 py-2 bg-neutral-300 text-ink-soft rounded-md"
              aria-label="Go back to previous step"
              disabled={isProcessing || isPending}
            >
              Back
            </Link>
          ) : (
            <button
              onClick={() => handleStepChange(-1)}
              className="px-4 py-2 bg-neutral-300 text-ink-soft rounded-md"
              aria-label="Go back to previous step"
              disabled={isProcessing || isPending}
            >
              Back
            </button>
          )}
          {currentStep === totalSteps ? (
            formData.emailVarified ? (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-accent text-accent-foreground hover:bg-primary hover:text-ink-inverse rounded-md"
                aria-label="Submit form"
                disabled={isProcessing || isPending}
              >
                {isProcessing || isPending ? <Spinner /> : 'Submit'}
              </button>
            ) : (
              <button
                onClick={() => {
                  toast.error('Please enter a valid OTP', {
                    position: "top-center",
                  });
                }}
                className="px-4 py-2 bg-accent text-accent-foreground hover:bg-primary hover:text-ink-inverse rounded-md"
                aria-label="Submit form - disabled"

              >
                Submit
              </button>
            )
          ) : (
            <button
              onClick={() => formData.email ? handleStepChange(1) : setErrorMessage('Please fill the required fields.')}
              className="px-4 py-2 bg-accent text-accent-foreground hover:bg-primary hover:text-ink-inverse rounded-md"
              aria-label="Continue to next step"
              disabled={isProcessing || isPending}
            >
              {isProcessing || isPending ? <Spinner /> : 'Continue'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
