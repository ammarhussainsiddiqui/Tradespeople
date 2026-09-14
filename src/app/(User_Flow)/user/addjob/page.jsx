'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Progress from '../../../../components/Progress';
import { useRouter } from 'next/navigation';
import Step1 from '../../../../components/UnderstandingSteps/Step1add';
import Step2 from '../../../../components/UnderstandingSteps/Step2add';
import InjectStep from '../../../../components/UnderstandingSteps/InjectStep';
import QuestionImage from '../../../assets/Plumber.webp';
import Spinner from '../../../../components/Spinner';
import PopupSpinner from '../../../../components/PopupSpinner';
import { getUserDetails } from '../../../../actions/auth';
import { isValidUKPostalCode } from '../../../../utils/functions';
import { toast } from "react-toastify";
import './RadioButtonStyles.css';
import * as Sentry from '@sentry/nextjs';

const Page = () => {
  const [loadingMain, setLoadingMain] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [showInitialStep, setShowInitialStep] = useState(true);
  const [loading, setLoading] = useState(false);

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
    setLoadingMain(true);
    setLoading(true);
    const user = await getUserDetails();
    try {
      const response = await fetch(`/api/service-questions?serviceId=${serviceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
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
        setCurrentStep((prev) => prev + 1); // Move to Step2
      }
      else if (currentStep === questions.length + 2) {
        setCurrentStep((prev) => prev + 2); // Move to Step3
      }
      else if (currentStep === questions.length + 3) {
        handleSubmit();
      } else {
        setCurrentStep((prev) => Math.min(prev + 1, questions.length + 1));
      }
    }
  };
  const handlePostcodeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      postcode: value,
    }));
  };


  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      description: value,
    }));
  };

  const handleHeadlineChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      headline: value,
    }));
  };

  const handleSubmit = async () => {
    const user = await getUserDetails();

    const isPostalValid = isValidUKPostalCode(formData.postcode);
    if (!isPostalValid) {
      toast.error('Invalid postcode', {
        position: "top-center",
      });
      return (false);
    }
    setLoading(true);
    try {
      const jobResponse = await fetch('/api/job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        cache: "no-cache",
        body: JSON.stringify({ userId: user.id, job: formData, postcode: formData?.postcode }),
      });

      const jobResult = await jobResponse.json();
      if (jobResponse.ok && jobResult.success) {
        router.push(`/user/myjobs/${jobResult?.job?.id}`);
      }
    } catch (error) {
      Sentry.captureException('Error during form submission:', error);
      setError('There was an issue submitting the form. Please try again.');
      setLoading(false);
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
      } else if (currentStep < questions.length + 1) {
        setCurrentStep((prev) => prev + 1); // Move to Step2
      } else if (currentStep === questions.length + 3) {
        handleSubmit();
      } else if (formData[questions[currentStep - 2]?.question]) {
        setCurrentStep((prev) => Math.min(prev + 1, questions.length + 1));
      }
    }
  };

  function containsContactInfo(text) {
    // Regex patterns for emails and phone numbers
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phonePattern = /\b(\+?\d{1,3}?[-.\s]?)(\(?\d{1,4}\)?[-.\s]?)?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b/;
    const contactWords = ["contact", "reach me", "email me", "phone"];

    // Search for emails and phone numbers
    if (emailPattern.test(text) || phonePattern.test(text)) {
      return true;
    }

    // Search for contact-related words
    for (let word of contactWords) {
      if (text.toLowerCase().includes(word.toLowerCase())) {
        return true;
      }
    }

    return false;
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentStep, showInitialStep, formData, questions]);

  return (
    <div className="content max-w-7xl mx-auto w-full  px-3  bg-muted">
      <div className='w-full'>
        {loadingMain ? (
          <div style={{ margin: '0 auto' }} className="inset-0 z-50 flex items-center justify-center">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-accent border-r-accent border-b-transparent border-l-transparent">
            </div>
          </div>
        ) : (
          <>
            <div className='flex flex-col xl:text-center md:text-center justify-between'>
              <h2 className="mt-4 text-2xl font-semibold text-ink-soft">Post a job for FREE
                {currentStep == 1 ? '' :
                  <>
                    {formData.serviceName ? ` (${formData.serviceName})` : ''}
                  </>
                }
              </h2>
              <p className='text-sm'>Get responses from screened and reviewed tradespeople near you</p>
            </div>
            {!showInitialStep && (
              <div className='mt-4 mb-10'>
                <Progress currentStep={currentStep - 1} totalSteps={questions.length + 2} />
                {!showInitialStep && (
                  <p className="mt-5 text-sm text-muted-foreground text-right">Step {currentStep - 1}/{questions.length + 2
                  }</p>
                )}
              </div>
            )}
            <div className="max-h-screen h-auto mt-14 flex flex-col items-center justify-center mb-10">
              <div className=" ">
                {error ? (
                  <div className="text-destructive text-center mb-4">{error}</div>
                ) : (
                  <>
                    {showInitialStep && (
                      <div className=' w-screen max-w-md px-8 py-6 bg-surface rounded-lg shadow-md border border-neutral-200'>
                        <Step1
                          data={formData}
                          handleChange={handleChange}
                          servicesUrl="/api/services"
                        />
                      </div>
                    )}
                    {!showInitialStep && currentStep <= questions.length + 1 && questions[currentStep - 2] && (
                      <div className=' w-screen max-w-md px-8 py-6 bg-surface rounded-lg shadow-md border border-neutral-200'>
                        <div className="flex flex-col items-center justify-center">
                          <Image src={QuestionImage} alt="Service Icon" width={100} height={100} />
                        </div>
                        <label htmlFor="question" className="block text:md xl:text-center md:text-center md:text-xl font-semibold font-medium text-ink-soft py-4">
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
                                onChange={handleChange}
                                className="radio-input text-left"
                              />
                              <label
                                htmlFor={`answer-${index}`}
                                className="radio-tile"
                              >
                                <span className="radio-label">{answer}</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {currentStep === questions.length + 2 && currentStep !== 1 && (
                      <InjectStep
                        data={formData}
                        handleChangeDescription={handleDescriptionChange}
                        handleChangeHeadline={handleHeadlineChange}
                      />
                    )}
                    {currentStep === questions.length + 3 && currentStep !== 1 && (
                      <div className=' w-screen max-w-md px-8 py-6 bg-surface rounded-lg shadow-md border border-neutral-200'>
                        <Step2
                          data={formData}
                          handleChange={handlePostcodeChange}
                          handleSubmit={handleSubmit}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="mt-2 mb-4 flex justify-between">
              {currentStep > 1 && currentStep <= questions.length + 2 || currentStep > 2 && currentStep <= questions.length + 3 ?
                (
                  <>
                    {currentStep === 2 || currentStep === 3 && currentStep !== 1 ?
                      <button
                        onClick={() => {
                          setShowInitialStep(true),
                            setCurrentStep(1)
                        }}
                        className="px-4 py-2 bg-neutral-300 text-ink-soft rounded-md flex items-center"
                        disabled={loading}
                      >
                        {/* {loading && <Spinner className="text-ink-soft" />} */}
                        Back
                      </button>
                      :
                      <button
                        onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
                        className="px-4 py-2 bg-neutral-300 text-ink-soft rounded-md flex items-center"
                        disabled={loading}
                      >
                        {/* {loading && <Spinner className="text-ink-soft" />} */}
                        Back
                      </button>
                    }
                  </>
                ) : (
                  <div></div>
                )}
              {formData?.services && (
                <>
                  {showInitialStep ?
                    <button
                      onClick={() => {
                        if (showInitialStep) {
                          handleContinue();
                        }
                        else if (currentStep === questions.length + 2 && currentStep !== 1) {
                          if (formData?.description !== "" && formData?.headline !== "" && formData?.description !== undefined && formData?.headline !== undefined) {
                            const wordCount = formData?.description.trim().length;
                            const wordCountHeadline = formData?.headline.trim().length;
                            if (wordCount >= 5 && wordCount <= 250) {
                              if (wordCountHeadline >= 1 && wordCountHeadline <= 100) {
                                const resultOfDescription = containsContactInfo(formData?.description)
                                const resultOfHeadline = containsContactInfo(formData?.headline)
                                if (!resultOfDescription && !resultOfHeadline) {
                                  setCurrentStep(currentStep + 1);
                                } else {
                                  toast.error('Sharing contact details is not permitted in this section. Please refrain from including personal contact information!', {
                                    position: "top-center",
                                  });
                                }
                              }
                              else {
                                toast.error('Headline must be between 1 and 100 characters.', {
                                  position: "top-center",
                                });
                              }

                            } else {
                              toast.error('Description must be between 5 and 250 characters.', {
                                position: "top-center",
                              });
                            }
                          } else {
                            toast.error('Headline & Description are required!', {
                              position: "top-center",
                            });
                          }

                        }
                        else if (currentStep === questions.length + 3 && currentStep !== 1) {
                          handleSubmit();

                        } else if (formData[questions[currentStep - 2]?.question]) {
                          setCurrentStep((prev) => Math.min(prev + 1, questions.length + 1));
                        }
                      }}
                      className="px-4 py-2  bg-accent text-accent-foreground hover:bg-primary hover:text-ink-inverse rounded-md flex items-center"
                      disabled={loading}
                    >
                      {loading && <PopupSpinner className="text-ink-inverse" />}
                      {showInitialStep ? 'Continue' : currentStep === questions.length + 3 && currentStep !== 1 ?
                        <>
                          {loading && <Spinner className="text-ink-soft" />}
                          Submit
                        </>
                        : 'Next'}
                    </button>
                    :
                    currentStep === questions.length + 2 && currentStep !== 1 ?
                      <>
                        <button
                          onClick={() => {
                            if (showInitialStep) {
                              handleContinue();
                            }
                            else if (currentStep === questions.length + 2 && currentStep !== 1) {
                              if (formData?.description !== "" && formData?.headline !== "" && formData?.description !== undefined && formData?.headline !== undefined) {
                                const wordCount = formData?.description.trim().length;
                                if (wordCount >= 5 && wordCount <= 500) {
                                  const resultOfDescription = containsContactInfo(formData?.description)
                                  const resultOfHeadline = containsContactInfo(formData?.headline)
                                  if (!resultOfDescription && !resultOfHeadline) {
                                    setCurrentStep(currentStep + 1);
                                  } else {
                                    toast.error('Sharing contact details is not permitted in this section. Please refrain from including personal contact information!', {
                                      position: "top-center",
                                    });
                                  }
                                } else {
                                  toast.error('Description must be between 5 and 500 characters.', {
                                    position: "top-center",
                                  });
                                }
                              } else {
                                toast.error('Headline & Description are required!', {
                                  position: "top-center",
                                });
                              }

                            }
                            else if (currentStep === questions.length + 3 && currentStep !== 1) {
                              handleSubmit();

                            } else if (formData[questions[currentStep - 2]?.question]) {
                              setCurrentStep((prev) => Math.min(prev + 1, questions.length + 1));
                            }
                          }}
                          className="px-4 py-2  bg-accent text-accent-foreground hover:bg-primary hover:text-ink-inverse rounded-md flex items-center"
                          disabled={loading}
                        >
                          {loading && <PopupSpinner className="text-ink-inverse" />}
                          {showInitialStep ? 'Continue' : currentStep === questions.length + 3 && currentStep !== 1 ?
                            <>
                              {loading && <Spinner className="text-ink-soft" />}
                              Submit
                            </>
                            : 'Next'}
                        </button>
                      </>
                      :
                      currentStep === questions.length + 3 && currentStep !== 1 ? <>
                        <button
                          onClick={() => {
                            if (showInitialStep) {
                              handleContinue();
                            }
                            else if (currentStep === questions.length + 2 && currentStep !== 1) {
                              //alert("There")
                              if (formData?.description !== "" && formData?.headline !== "" && formData?.description !== undefined && formData?.headline !== undefined) {
                                const wordCount = formData?.description.trim().length;
                                if (wordCount >= 5 && wordCount <= 500) {
                                  const resultOfDescription = containsContactInfo(formData?.description)
                                  const resultOfHeadline = containsContactInfo(formData?.headline)
                                  if (!resultOfDescription && !resultOfHeadline) {
                                    setCurrentStep(currentStep + 1);
                                  } else {
                                    toast.error('Sharing contact details is not permitted in this section. Please refrain from including personal contact information!', {
                                      position: "top-center",
                                    });
                                  }
                                } else {
                                  toast.error('Description must be between 5 and 500 characters.', {
                                    position: "top-center",
                                  });
                                }
                              } else {
                                toast.error('Headline & Description are required!', {
                                  position: "top-center",
                                });
                              }

                            }
                            else if (currentStep === questions.length + 3 && currentStep !== 1) {
                              handleSubmit();

                            } else if (formData[questions[currentStep - 2]?.question]) {
                              setCurrentStep((prev) => Math.min(prev + 1, questions.length + 1));
                            }
                          }}
                          className="px-4 py-2  bg-accent text-accent-foreground hover:bg-primary hover:text-ink-inverse rounded-md flex items-center"
                          disabled={loading}
                        >
                          {loading && <PopupSpinner className="text-ink-inverse" />}
                          {showInitialStep ? 'Continue' : currentStep === questions.length + 3 && currentStep !== 1 ?
                            <>
                              {loading && <Spinner className="text-ink-soft" />}
                              Submit
                            </>
                            : 'Next'}
                        </button>
                      </> : ""

                  }


                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
