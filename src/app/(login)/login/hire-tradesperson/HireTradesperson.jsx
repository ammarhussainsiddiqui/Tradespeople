'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Progress from '../../../../components/Progress';
import { useRouter } from 'next/navigation';
import Step1 from '../../../../components/UnderstandingSteps/Step1';
import QuestionImage from '../../../assets/Plumber.webp';
import Spinner from '../../../../components/Spinner'; // Import the Spinner component
import './RadioButtonStyles.css'; // Import the CSS file
import { generateToken, isValidUKPostalCode } from '../../../../utils/functions'
import * as Sentry from '@sentry/nextjs';
import { useGlobalState } from '../../../../app/context/GlobalStateContext';


const Page = () => {
  const { understand, setUnderstandState, servicename, setservicename } = useGlobalState();
  const [loadingMain, setLoadingMain] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [showInitialStep, setShowInitialStep] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formComplete, setFormComplete] = useState(false);
  const [serviceName, setServiceName] = useState('')
  const router = useRouter();





  useEffect(() => {


    const query = new URLSearchParams(window.location.search);
    const serviceId = query.get('serviceId');
    const postcode = query.get('code');

    if (!serviceId) {
      setShowInitialStep(true);
      setCurrentStep(1);

    } else {
      setFormData({ services: serviceId, postcode: postcode });
      fetchQuestions(serviceId);
    }
  }, []);

  const fetchQuestions = async (serviceId) => {
    setLoading(true);
    setLoadingMain(true);
    const token = await generateToken();
    try {
      const response = await fetch(`/api/service-questions?serviceId=${serviceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,

        },
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setQuestions(result.questions);
      setCurrentStep(2);
      setShowInitialStep(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingMain(false);
      setLoading(false);
    }
  };


  const handleChange = (e) => {

    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (!showInitialStep) {
      if (currentStep === questions.length + 1) {
        setFormComplete(true);
      } else {
        setCurrentStep((prev) => Math.min(prev + 1, questions.length + 1));
      }
    }
  };

  // Run handleSubmit when the form is marked complete
  useEffect(() => {
    if (formComplete && !loading) {
      handleSubmit();
    }
  }, [formComplete]);

  const handleSubmit = async () => {
    if (loading) return; // Prevent re-trigger if already loading
    setLoading(true);
    try {
      setUnderstandState(formData)
      router.push('/login/description');

    } catch (error) {
      Sentry.captureException('Error during form submission:', error);
      setError('There was an issue submitting the form. Please try again.');
    } finally {
      setLoading(false);
      setFormComplete(false);
    }

  };

  const handleContinue = async () => {
    if (formData.services) {
      setLoading(true);
      await fetchQuestions(formData.services);
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (showInitialStep) {
        handleContinue();
      } else if (currentStep === questions.length + 1) {
        handleSubmit();
      } else if (formData[questions[currentStep - 2]?.question]) {
        setCurrentStep((prev) => Math.min(prev + 1, questions.length + 1));
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentStep, showInitialStep, formData, questions]);

  useEffect(() => {
    let serviceNames = servicename;
    setservicename(serviceNames)
  })
  return (


    <>
      <div className="content max-w-7xl mx-auto w-screen px-4 sm:px-6 lg:px-8 bg-muted">
        <div className='w-screen'>
          <div className='flex flex-col xl:text-center md:text-center justify-between'>
            <h2 className="mt-4 text-2xl font-semibold text-ink-soft">Post a job for FREE
              {currentStep == 1 ? '' :
                <>
                  {serviceName ? ` (${serviceName})` : ''}
                </>
              }
            </h2>
            <p className='text-sm'>Get responses from screened and reviewed tradespeople near you</p>
          </div>
          {!showInitialStep && (
            <div className='mt-4 mb-10'>
              <Progress currentStep={1} totalSteps={3} />
              {!showInitialStep && (
                <p className="mt-5 text-sm text-muted-foreground text-right">Step {1}/{3}</p>
              )}
            </div>
          )}
          <div className="max-h-screen h-auto mt-14 flex flex-col items-center justify-center mb-10">
            <div className="w-full max-w-md px-8 py-6 bg-surface rounded-lg shadow-md border border-neutral-200">
              {error ? (
                <div className="text-destructive text-center mb-4">{error}</div>
              ) : (
                <>
                  {showInitialStep && (
                    <Step1
                      loading={loadingMain}
                      data={formData}
                      handleChange={handleChange}
                      servicesUrl="/api/services"
                    />
                  )}
                  {!showInitialStep && questions[currentStep - 2] && (
                    <div >
                      <div className="flex flex-col items-center justify-center">
                        <Image src={QuestionImage} alt="Service Icon" width={100} height={100} />
                      </div>
                      <label htmlFor="question" className="block text:md md:text-xl xl:text-center md:text-center font-semibold font-medium text-ink-soft py-4">
                        {questions[currentStep - 2].question}
                      </label>
                      <div className="flex flex-col radio-inputs text-left">
                        {questions[currentStep - 2].answers.map((answer, index) => (
                          <div key={index}>
                            <input
                              id={`answer-${index}`}
                              type="radio"
                              name={questions[currentStep - 2].question}
                              value={answer}
                              checked={formData[questions[currentStep - 2].question] === answer}
                              onClick={handleChange}
                              className="radio-input text-left"
                            />
                            <label
                              htmlFor={`answer-${index}`}
                              className="radio-tile "
                            >

                              <span className="radio-label ">{answer}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="mt-2 mb-4 flex justify-between">
            {currentStep == 2 && (
              <button
                onClick={() => { setCurrentStep(1), setShowInitialStep(true) }}
                className="px-4 py-2 bg-neutral-300 text-ink-soft rounded-md flex items-center"
                disabled={loading}
              >
                {loading && <Spinner className="text-ink-soft" />}
                Back
              </button>
            )
            }
            {currentStep > 2 && currentStep <= questions.length + 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
                className="px-4 py-2 bg-neutral-300 text-ink-soft rounded-md flex items-center"
                disabled={loading}
              >
                {loading && <Spinner className="text-ink-soft" />}
                Back
              </button>
            ) : (
              <div></div>
            )}
            {showInitialStep && (
              <button
                onClick={() => {
                  if (showInitialStep) {
                    handleContinue();
                  } else if (currentStep === questions.length + 1) {
                    handleSubmit();
                  } else if (formData[questions[currentStep - 2]?.question]) {
                    setCurrentStep((prev) => Math.min(prev + 1, questions.length + 1));
                  }
                }}
                className="px-4 py-2 bg-accent text-accent-foreground  hover:bg-primary hover:text-ink-inverse rounded-md flex items-center"
                disabled={loading}
              >
                {loading && <Spinner className="text-ink-inverse" />}
                {currentStep === questions.length + 1 ? 'Continue' : 'Continue'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;




