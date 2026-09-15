"use client";
import React, { useState, useEffect, use } from 'react';
import Progress from '../../../../components/Progress';
import Step1 from '../../../../components/RegistrationSteps/Step1';
import Step2 from '../../../../components/RegistrationSteps/Step2';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeOff } from 'lucide-react';
import Spinner from '../../../../components/Spinner';
import { login } from '../../../../actions/auth';
import { useFormState } from "react-dom";
import Link from 'next/link';
import { getUserDetails, updatedAreaSegments } from '../../../../actions/auth';
import { generateToken } from '../../../../utils/functions';
import { toast } from "react-toastify";
import * as Sentry from '@sentry/nextjs';
import { useGlobalState } from '../../../../app/context/GlobalStateContext';
const Page = () => {
  const router = useRouter();
  const { understand, setUnderstandState, userId, setUserId, jobCache, setjobCache } = useGlobalState();
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [Email, setEmail] = useState('');
  const [Pwd, SetPwd] = useState('');
  const [login_error, setLogin_error] = useState('');
  const [emailExist, setEmailExist] = useState(false)
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const useRedirectIfEmpty = () => {
    useEffect(() => {
      if (!understand || Object.keys(understand).length === 0) {
        router.push('/login/hire-tradesperson');
      }
    }, [understand, router]);
  };
  useRedirectIfEmpty();
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [formData, setFormData] = useState({
    email: "",
    emailVarified: false,
    phone: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize form state with login action
  const [currentState, loginAction, isPending] = useFormState(login, {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleEmailVerification = (isVerified) => {
    setFormData((prevData) => ({
      ...prevData,
      emailVarified: isVerified
    }));
  };

  useEffect(() => {
    if (formData.emailVarified && currentStep === totalSteps) {
      handleSubmit();
    }
  }, [formData.emailVarified, currentStep]);

  const logedIn = async () => {
    const understandData = understand;
    const token = await generateToken();
    let job = JSON.parse(understandData);
    setIsProcessing(true)
    try {
      const response = await fetch(`/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        cache: "no-cache",
        body: JSON.stringify({
          email: formData?.email,
          password: Pwd,
          roleId: 1
        }),
      });
      const data = await response.json();
      setIsProcessing(false)
      if (data.success) {
        if (data.user.id) {
          const jobResponse = await fetch('/api/job', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            cache: "no-cache",
            body: JSON.stringify({ userId: data.user.id, job: job, postcode: job?.postcode }),
          });

          const jobResult = await jobResponse.json();
          if (jobResponse.ok && jobResult.success) {

            setUserId(data.user.id)
            const formDataEntries = new FormData();
            formDataEntries.append("email", data.user.email);
            formDataEntries.append("password", data.user.password || '00000');

            const response = await loginAction(formDataEntries);
            if (response?.zod_errors) {
              setErrorMessage('Validation errors occurred');
            } else if (response?.other) {
              setErrorMessage(response.other);
            } else {
            }
          } else {
            setErrorMessage('Error saving job details.');
          }
        } else {
          setErrorMessage('Error during signup.');
        }
      }

    } catch (error) {
      setIsProcessing(false)
      setLogin_error(error.message)
    }
  }
  const cacheName = 'job-cache';
  const saveToCache = async (data) => {
    setjobCache(data)
    router.push(`/login`);
  };

  const emailValidationCheck = async () => {
    setIsProcessing(true)
    const token = await generateToken();
    try {
      const validateEmail = await fetch(`/api/signup?email=${formData?.email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        cache: "no-cache",
      });
      const validationResult = await validateEmail.json();
      if (validationResult) {
        if (formData?.email) {
          handleStepChange(1)
        } else {
          setErrorMessage('Please fill the required fields.')
        }
        setIsProcessing(false)
      }
    } catch (error) {
      setErrorMessage('Failed to fatch data.')
    }
  }


  const [areas, setAreas] = useState([]);
  useEffect(() => {
    const getAreas = async () => {
      const areas = await updatedAreaSegments();

      setAreas(areas)
    }
    getAreas()
  }, [])

  function validatePostcode(postcode) {
    postcode = postcode.toUpperCase().replace(/\s+/g, '');
    const firstLetter = postcode.charAt(0);
    const secondChar = postcode.charAt(1);
    const prefix = postcode.slice(0, 2);

    let matchCondition = !isNaN(secondChar) ? firstLetter : prefix;

    const area = areas.find((area) => {
      if (Array.isArray(area.value)) {
        return area.value.includes(matchCondition);
      } else {
        return area.value === matchCondition;
      }
    });

    return area ? area.label : postcode;
  }


  const handleSubmit = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    const token = await generateToken();
    try {
      let job = understand;

      const signupResponse = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        cache: "no-cache",
        body: JSON.stringify({ name: "unknown", email: formData?.email, password: "00000", roleId: 1, postcode: validatePostcode(job?.postcode) }),
      });

      const signupResult = await signupResponse.json();

      if (signupResponse) {
        if (signupResult.userID) {
          const jobResponse = await fetch('/api/job', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            cache: "no-cache",
            body: JSON.stringify({ userId: signupResult.userID, job: job, postcode: job?.postcode }),
          });

          const jobResult = await jobResponse.json();
          if (jobResponse.ok && jobResult.success) {
            setUserId(signupResult?.userID)
            const formDataEntries = new FormData();
            formDataEntries.append("email", formData.email);
            formDataEntries.append("password", signupResult.password || '00000');
            formDataEntries.append("roleId", 1);
            formDataEntries.append("jobId", jobResult?.job?.id);
            const response = await loginAction(formDataEntries);
            if (response?.zod_errors) {
              setErrorMessage('Validation errors occurred');
              setIsProcessing(false);
            } else if (response?.other) {
              setErrorMessage(response.other);
              setIsProcessing(false);
            } else {
            }
          } else {
            setErrorMessage('Error saving job details.');
            setIsProcessing(false);
          }
        } else {
          setErrorMessage('Error during signup.');
          setIsProcessing(false);
        }
      } else {
        // Handle server response errors
        setIsProcessing(false);
        setErrorMessage(signupResult.message || 'Conflict during signup. Please check the details.');
      }
    } catch (error) {
      Sentry.captureException('Error during form submission:', error);
      setErrorMessage('Error during form submission. Please try again.');
      setIsProcessing(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 data={formData} handleChange={handleChange} />;
      case 2:
        return <Step2 data={formData} handleEmailVerification={handleEmailVerification} />;
      default:
        return <Step1 data={formData} handleChange={handleChange} />;
    }
  };

  const handleStepChange = (step) => {
    if (step === totalSteps && !formData.emailVarified) {
      setErrorMessage('Please verify your email before submitting.');
      return;
    }
    setCurrentStep((prev) => Math.max(1, Math.min(prev + step, totalSteps)));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (currentStep === totalSteps) {
        if (formData.emailVarified) {
          handleSubmit();
        }
      } else {
        if (formData.email) {
          emailValidationCheck(formData?.email);
        } else {
          setErrorMessage('Please fill the required fields.');
        }
      }
    }
  };


  return (
    <div className="content max-w-7xl mx-auto w-screen px-4 sm:px-6 lg:px-8 bg-muted">

      <div className='w-screen' onKeyDown={handleKeyDown} tabIndex={0}>
        {!emailExist ? (
          <>
            <div className='flex justify-between w-full md:text-center'>
              {currentStep == 2 ?
                <h2 className="font-semibold mt-4 text-2xl md:text-center text-ink-soft w-full">You’re almost there!</h2>
                :
                <h2 className="font-semibold mt-4 text-2xl md:text-center text-ink-soft w-full" >We’d love to get to know you!</h2>
              }

            </div>
            <div className='mt-4 w-full'>
              <Progress currentStep={currentStep} totalSteps={totalSteps} />
              <p style={{ textAlign: 'end' }} className="mt-5 text-sm text-muted-foreground text-left w-full">Step {currentStep}/{totalSteps}</p>
            </div>
          </>) :
          <div className='justify-center text-center mt-4'>
            <h2 className="mt-4 text-2xl font-semibold text-ink-soft">Login Your Account To Continue.</h2>
            <span className='text-sm text-muted-foreground'>Please Insert Password.</span>
          </div>
        }
        <div className="max-h-96 h-screen mt-4 flex flex-col items-center justify-center">
          <div className="w-full max-w-md px-8 py-6 bg-surface rounded-lg shadow-md border border-neutral-200">
            {showLoginDialog ?
              <>
                <form >
                  <div className="mb-4">
                    <label className="block text-ink-soft">Email <span className="text-destructive">*</span></label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      disabled
                      defaultValue={Email}
                      onChange={(e) => { setEmail(e.target.value.toLowerCase()) }}
                      placeholder="Enter your email address"
                      className="w-full p-3 border rounded-md focus:outline-none focus:border-accent"
                    />

                  </div>
                  <div className="mb-4">
                    <label className="block text-ink-soft">Password <span className="text-destructive">*</span></label>
                    <div className="relative">
                      <input
                        name="password"
                        onChange={(e) => { SetPwd(e.target.value) }}
                        value={Pwd}
                        type={showPassword ? 'text' : 'password'}
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
                      {currentState?.zod_errors?.password && (
                        <p className="text-destructive-soft-foreground">{currentState.zod_errors.password}</p>
                      )}
                    </div>
                  </div>

                  {login_error && (
                    <p className="text-destructive-soft-foreground">{login_error}</p>
                  )}

                  <div style={{ textAlign: 'end' }} className="w-full  mb-2">
                    <Link href={'/login/forget-password'} className="text-sm cursor-pointer text-accent ">Forgot Password?</Link>
                  </div>

                  <button type="button" disabled={isProcessing || isPending} onClick={logedIn} className="bgColor mb-2 w-full justify-center item-center text-accent-foreground font-semibold py-2 px-4 rounded-lg hover:bg-accent/90 focus:outline-none">

                    {isProcessing || isPending ? 'Loading...' : 'Log In'}

                  </button>
                </form>


              </>
              :
              <>
                {renderStep()}
              </>
            }
          </div>
        </div>
        {errorMessage && <p className="text-destructive text-center mt-2">{errorMessage}</p>}
        <div className="mt-4 mb-4 flex justify-between">
          {currentStep == 1 ?
            <Link href={'/login/find-matches'}
              onClick={() => handleStepChange(-1)}
              className="px-4 py-2 bg-neutral-300 text-ink-soft rounded-md"
              aria-label="Go back to previous step"
              disabled={isProcessing}
            >
              Back
            </Link>
            :
            <button
              onClick={() => handleStepChange(-1)}
              className="px-4 py-2 bg-neutral-300 text-ink-soft rounded-md"
              aria-label="Go back to previous step"
              disabled={isProcessing}
            >
              Back
            </button>
          }
          {currentStep === totalSteps ? (
            <>
              <button
                onClick={() => {
                  if (!formData.emailVarified) {
                    toast.error('Please enter a valid OTP', {
                      position: "top-center",
                    });
                  } else {
                    handleSubmit()
                  }
                }}
                className="px-4 py-2 bg-accent text-accent-foreground hover:bg-primary hover:text-ink-inverse rounded-md"
                aria-label="Submit form"
                disabled={isProcessing || isPending}
              >
                {isProcessing || isPending ? <Spinner /> : 'Submit'}
              </button>
            </>
          ) : (
            <>
              {!emailExist && (
                <button
                  onClick={() => formData?.email ? emailValidationCheck(formData?.email) : setErrorMessage('Please fill the required fields.')}
                  className="px-4 py-2 bg-accent text-accent-foreground hover:bg-primary hover:text-ink-inverse rounded-md"
                  aria-label="Continue to next step"
                  disabled={isProcessing || isPending}
                >
                  {isProcessing || isPending ? <Spinner /> : 'Continue'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;
