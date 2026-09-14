'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, Clock } from 'lucide-react';
import { getUserDetails } from '../../../../../actions/auth';
import * as Sentry from '@sentry/nextjs';
import { useGlobalState } from '../../../../../app/context/GlobalStateContext';


const Page = () => {
  const [lead, setLead] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [interested, setInterested] = useState(false);
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState(null);
  const { leadCache, setleadCache } = useGlobalState();

  const getUser = async (id) => {
    const user = await getUserDetails();
    try {
      const response = await fetch('/api/get-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      Sentry.captureException('Error fetching user data:', error);
      setError('Failed to fetch user data');
    }
  };

  const interestedStatus = async () => {
    const tradeperson = await getUserDetails();
    try {
      const response = await fetch('/api/interested', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tradeperson.token}`,
        },
        body: JSON.stringify({ jobId: lead?.id, tradepersonId: tradeperson.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch status data');
      }

      const data = await response.json();
      if (data.success) {
        setInterested(data.isInterested);
      }
    } catch (error) {
      Sentry.captureException('Error fetching status data:', error);
      setError('Failed to fetch status data');
    }
  };

  const sendEmail = () => {
    if (!lead || !user) {
      setError('Lead or user data is missing');
      return;
    }

    const subject = `Inquiry about ${lead.serviceType}`;
    const body = `
      Hello ${lead.userDetail},

      I am interested in the ${lead.serviceType} job you posted. 

      Here are the details:
      - Job Type: ${lead.job?.type || 'Not Provided'}
      - Description: ${lead.job?.description || 'Not Provided'}
      - Location: ${lead.postcode || 'Not Provided'}
      - Created At: ${new Date(lead.createdAt).toLocaleDateString() || 'Not Provided'}

      Thank you!
    `;

    const mailtoLink = `mailto:${user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const JobDetail = ({ job }) => {
    if (!job) {
      return <p className="text-sm text-muted-foreground">No job details available</p>;
    }

    return (
      <div className="mt-6 md:mt-8 space-y-4">
        {Object.entries(job).map(([key, value], index) => (
          <>
            {key == 'postcode' || key == 'services' || key == 'serviceName' ? '' :
              <div key={index}>
                <h2 className="text-sm font-semibold text-ink-strong">{key}</h2>
                <p className="text-sm text-accent">{String(value) || 'Not Provided'}</p>
              </div>}
          </>
        ))}
      </div>
    );
  };


  const JobQuestions = ({ questions }) => (
    <div className="mt-6 md:mt-8 space-y-4">
      {questions?.length ? (
        questions.map((q, index) => (
          <div key={index}>
            <h2 className="text-sm font-semibold text-ink-strong">{q.question}</h2>
            <p className="text-sm text-accent">{q.selectedAnswer || 'No Answer Provided'}</p>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">No questions provided</p>
      )}
    </div>
  );

  useEffect(() => {
    const fetchProfile = async () => {
      const cached = leadCache
      if (cached) {
        setLead(cached);
        setJobs(cached.job || null);
        getUser(cached.userId);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (lead) {
      interestedStatus();
    }
  }, [lead]);

  if (error) {
    return (
      <div className="p-4">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="p-6 md:p-10 lg:p-16 rounded-xl bg-surface">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex flex-col flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-ink-strong mb-2">
                {lead?.serviceType || 'No Service Type Provided'}
              </h1>
              <p className="text-sm text-muted-foreground">By {lead?.userDetail || 'No User Detail Provided'}.</p>

              <div className='flex flex-col py-4'>
                <p className="text-sm text-foreground font-bold">
                  <i>{user?.email || 'No Email Provided'}</i>
                </p>
              </div>

              <div className="mt-2 md:mt-4 flex items-center flex-wrap space-x-2 sm:space-x-3 text-accent">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">{lead?.postcode || 'No Postcode Provided'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">{new Date(lead?.createdAt).toLocaleDateString() || 'No Date Provided'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-4 md:flex-col md:space-x-0 md:space-y-2 items-start md:items-end">
              <button
                onClick={sendEmail}
                className="w-full sm:w-auto bg-surface text-foreground text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 rounded-md border border-neutral-300"
              >
                Send Email
              </button>
            </div>
          </div>

          {/* Conditionally render JobQuestions or JobDetail */}
          {lead?.job?.questions?.length ? (
            <JobQuestions questions={lead.job.questions} />
          ) : (
            <JobDetail job={jobs} />
          )}

          {/* Images Section */}
          <div className="mt-6 md:mt-8 flex gap-4">
            {lead?.job?.images?.map((img, index) => (
              <div key={index} className="relative w-24 h-24 sm:h-32 md:h-40 sm:w-32 md:w-40 bg-neutral-200">
                {img ? (
                  <Image src={img} className='rounded-xl' alt={`Image ${index + 1}`} layout="fill" objectFit="cover" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-neutral-300 rounded-xl">No Image</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
