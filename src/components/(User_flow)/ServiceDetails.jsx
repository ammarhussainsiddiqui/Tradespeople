import React, { useEffect, useState, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import Image from 'next/image';
import Select from 'react-select';
import { useRouter } from 'next/navigation';
import { getUserDetails } from '../../actions/auth'
import * as Sentry from '@sentry/nextjs';

// Spinner Component
const Spinner = () => (
  <div className="flex justify-center items-center h-32">
    <div className="w-16 h-16 border-4 border-t-4 border-accent rounded-full animate-spin"></div>
  </div>
);

const ServiceDetails = ({ data }) => {
  const router = useRouter();

  let service = data?.service
  const [serviceTitle, setService] = useState({});
  const [serviceData, setServiceData] = useState({});
  const [serviceDetails, setServiceDetails] = useState(service);
  const [isEditing, setIsEditing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState(data?.jobData?.images || []);
  const [description, setDescription] = useState(data?.jobData?.description || '');
  const [headline, setHeadline] = useState(data?.jobData?.headline || '');
  const portfolioImageRef = useRef(null);

  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setServiceData(service);
    setService(service);
    setServiceDetails(service);
    setPortfolioImages(data?.jobData?.images || []);
    setDescription(data?.jobData?.description || '');
    setHeadline(data?.jobData?.headline || '')
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServiceDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuestionChange = (index, selectedOption) => {
    const newQuestions = [...serviceDetails?.questions];
    newQuestions[index].selectedAnswer = selectedOption ? selectedOption.value : '';
    setServiceDetails((prev) => ({
      ...prev,
      questions: newQuestions,
    }));
  };



  const handleSave = async () => {
    setIsLoading(true);
    const jwt = await getUserDetails();
    try {
      // Call API to save changes
      const updatedServiceDetails = {
        ...serviceDetails,
        images: portfolioImages,
        description: description,
        jobId: data?.jobId,
        postcode: data?.jobData?.postcode,
        services: data?.jobData?.services,
      };

      const jobResponse = await fetch('/api/updateJob', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt?.token}`,
        },
        cache: "no-cache",
        body: JSON.stringify({ id: updatedServiceDetails.jobId, job: updatedServiceDetails }),
      });

      const jobResult = await jobResponse.json();
      if (jobResult.success || jobResult.ok) {

        setStatus('Job Updated Successfully.')
        router.push(`/user/myjobs`);
        setError('')
      } else {
        setStatus('')
        setError('Error Updating Job.')
      }
    } catch (error) {
      Sentry.captureException('Error saving service details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePortfolioImageChange = (event) => {
    const files = Array.from(event.target.files);
    const newImages = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result);
        if (newImages.length === files.length) {
          setPortfolioImages((prevImages) => [...prevImages, ...newImages].slice(0, 4)); // Limit to 4 images
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePortfolioImage = (index) => {
    setPortfolioImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleImageClick = (ref) => {
    ref.current.click();
  };

  const handleDeleteJob = async () => {
    setIsLoading(true);
    const jwt = await getUserDetails();
    try {
      const jobResponse = await fetch('/api/job', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt?.token}`,
        },
        cache: "no-cache",
        body: JSON.stringify({ id: data?.jobId }),
      });
      const jobResult = await jobResponse.json();
      if (jobResult.success || jobResult.ok) {
        router.push(`/user/myjobs`);
        setStatus('Job marked as deleted.')
        setError('')
      } else {
        setStatus('')
        setError('Error Deleting Job.')
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }

  };

  const formatAnswerOptions = (answers) => {
    return answers.map((answer) => ({
      value: answer,
      label: answer,
    }));
  };

  return (
    <div className="space-y-8">
      <div className="service-details mx-auto p-4 bg-surface rounded-lg border border-neutral-200">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold mb-4 text-ink-strong">Job Details</h2>
        </div>
        {isLoading && <Spinner />}
        {!isLoading && (
          <>
            {isEditing ? (
              <div>
                <div className="mb-4">
                  <label className="block text-ink-soft ">Headline</label>
                  <input
                    disabled
                    type="text"
                    name="headline"
                    defaultValue={headline}
                    onChange={handleChange}
                    className="mt-1 text-2xl bg-surface"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-ink-soft text-sm"><b>Main Trade:</b> {serviceDetails?.mainTrade.type} </label>
                </div>
                <label className="block text-foreground text-2xl bg-surface">Questions</label>
                {serviceDetails?.questions.map((question, index) => (
                  <div key={question.id} className="mb-4">
                    <input
                      disabled
                      name="question"
                      value={question.question}
                      readOnly
                      className="mt-1 w-full bg-surface"
                    />
                    <label className="block text-ink-soft mt-2">Answers</label>
                    <Select
                      value={formatAnswerOptions(question.answers).find(
                        (option) => option.value === question.selectedAnswer
                      )}
                      onChange={(selectedOption) =>
                        handleQuestionChange(index, selectedOption)
                      }
                      options={formatAnswerOptions(question.answers)}
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          backgroundColor: 'hsl(var(--surface-soft))',
                          borderColor: 'hsl(var(--surface-soft))',
                          borderRadius: '0.5rem',
                          marginTop: '5px',
                          padding: '0.25rem',
                          boxShadow: 'none',
                          '&:hover': {
                            borderColor: 'hsl(var(--neutral-300))',
                          },
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isFocused
                            ? 'hsl(var(--accent))'
                            : 'hsl(var(--surface))',
                          color: 'hsl(var(--ink-strong))',
                          '&:hover': {
                            backgroundColor: 'hsl(var(--accent))',
                            color: 'hsl(var(--surface))',
                          },
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          color: 'hsl(var(--ink-strong))',
                        }),
                      }}
                      placeholder="Select answer"
                    />
                  </div>
                ))}
                <section>
                  <h3 className="text-xl font-semibold mt-4">Add Images</h3>
                  <span className="text-xs mb-4 block">Add your Issue images.</span>
                  <div className="flex flex-wrap gap-4 mb-6">
                    {portfolioImages.map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={image}
                          alt={`Portfolio Image ${index + 1}`}
                          className="rounded-md h-24 w-24 md:w-20 md:h-20 border-2 border-accent"
                          width={96}
                          height={96}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePortfolioImage(index)}
                          className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full p-1 text-xs"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                    {portfolioImages.length < 4 && (
                      <button
                        type="button"
                        onClick={() => handleImageClick(portfolioImageRef)}
                        className="flex items-center justify-center w-24 h-24 md:w-20 md:h-20 border-2 border-accent rounded-md text-neutral-600 bg-neutral-100"
                      >
                        +
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    name="portfolioImages"
                    accept="image/*"
                    onChange={handlePortfolioImageChange}
                    multiple
                    className="hidden"
                    ref={portfolioImageRef}
                  />
                  <label className="block text-ink-soft">Add Description</label>
                  <Textarea
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1"
                  />
                </section>
                <div className='md:flex justify-between'>
                  <Button onClick={handleSave} className="bg-accent text-ink-inverse mt-4">
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleDeleteJob}
                    className="bg-destructive text-destructive-foreground mt-4 "
                  >
                    Delete Job
                  </Button>
                </div>
                <span className='text-sm text-success'>{status && (status)} </span>
                <span className='text-sm text-destructive'>{error && (error)} </span>
              </div>
            ) : (
              <div>
                <p><strong>Service Type:</strong> {serviceDetails?.type}</p>
                <p><strong>Main Trade:</strong> {serviceDetails?.mainTrade.type}</p>
                {serviceDetails?.questions.map((question) => (
                  <div key={question.id}>
                    <p><strong>Question:</strong> {question.question}</p>
                    <p><strong>Selected Answer:</strong> {question.selectedAnswer}</p>
                    <p><strong>Answers:</strong></p>
                    <ul>
                      {question.answers.map((answer, answerIndex) => (
                        <li key={answerIndex}>{answer}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <section>
                  <h3 className="text-xl font-semibold mt-4">Portfolio</h3>
                  <div className="flex flex-wrap gap-4 mb-6">
                    {portfolioImages.map((image, index) => (
                      <Image
                        key={index}
                        src={image}
                        alt={`Portfolio Image ${index + 1}`}
                        className="rounded-md h-24 w-24 md:w-20 md:h-20 border-2 border-accent"
                        width={96}
                        height={96}
                      />
                    ))}
                  </div>
                  <p><strong>Description:</strong> {description}</p>
                </section>
                <Button onClick={() => setIsEditing(true)} className="bg-accent text-ink-inverse mt-4">
                  Edit
                </Button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default ServiceDetails;
