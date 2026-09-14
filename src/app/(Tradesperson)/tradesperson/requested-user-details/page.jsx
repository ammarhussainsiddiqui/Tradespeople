'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, Clock } from 'lucide-react';
import Spinner from '../../../../components/Spinner';
import { getUserDetails } from '../../../../actions/auth';
import { Button } from '../../../../components/ui/button';
import { useRouter } from 'next/navigation';
import UserImage from '../../../assets/userImage.webp'
import { toast } from "react-toastify";
import { useGlobalState } from '../../../../app/context/GlobalStateContext';

const Page = () => {
  const router = useRouter();

  const [lead, setLead] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [interested, setInterested] = useState(false);
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState(null);
  const { qouteCache, setqouteCache } = useGlobalState();

  const JobDetail = ({ job }) => {
    if (!job) {
      return <p className="text-sm text-muted-foreground">No Question details available</p>;
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
        questions?.map((q, index) => (
          <div key={index}>
            <h2 className="text-sm font-semibold text-ink-strong">{q?.question}</h2>
            <p className="text-sm text-accent">{q?.selectedAnswer || 'No Answer Provided'}</p>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">No questions provided</p>
      )}
    </div>
  );

  useEffect(() => {
    const fetchProfile = async () => {
      const cached = qouteCache
      if (cached) {

        setLead(cached);
        setJobs(cached?.job?.job || null);
        setUser(cached?.user)
      }
    };

    fetchProfile();
  }, []);

  const sendQuote = async (data) => {
    const user = await getUserDetails();
    let price = document.getElementById('price').value
    if (price === null || price === undefined || price === '') {

      toast.error('Please Insert a Valid Value', {
        position: "top-center",
      });

    } else {
      price = Number(price)

      setLoading(true)

      try {
        const jobResponse = await fetch('/api/quote', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
          },
          cache: "no-cache",
          body: JSON.stringify({ id: data?.id, quotePrice: price }),
        });

        const jobResult = await jobResponse.json();
        if (jobResponse.ok && jobResult.success) {
          router.push('/tradesperson/leads')
        }
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }

  }

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
            <div className='flex w-full justify-between'>
              <div className="flex flex-col flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-ink-strong mb-2">
                  {lead?.servicedata || 'No Service Type Provided'} <i className='text-success'> {lead?.isAccepted ? '( Accepted )' : ''}</i>
                </h1>
                <p className="text-sm text-muted-foreground">By {lead?.user?.firstName + " " + lead?.user?.lastName || 'No User Detail Provided'}.</p>
                {lead?.isAccepted ? (
                  <div className='flex flex-col py-4'>
                    <p className="text-sm text-foreground font-bold">
                      <i>{user?.email || 'No Email Provided'}</i>
                    </p>
                  </div>
                )
                  :
                  (
                    <div className='flex flex-col py-4'>
                      <p className="text-sm text-foreground font-bold">
                        <i>{user?.email.substring(0, 4) + '******gmail.com' || 'No Email Provided'}</i>
                      </p>
                    </div>
                  )
                }

                <div className="mt-2 md:mt-4 flex items-center flex-wrap space-x-2 sm:space-x-3 text-accent">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-xs sm:text-sm">{lead?.job?.job?.postcode || 'No Postcode Provided'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-xs sm:text-sm">{new Date(lead?.job?.createdAt).toLocaleDateString() || 'No Date Provided'}</span>
                  </div>
                </div>
              </div>
              <div
                className='hidden md:block'
              >
                <Image className='rounded-full' height={100} width={100} src={lead?.user?.profileUrl || UserImage} alt='..' />
              </div>
            </div>
          </div>

          {/* Conditionally render JobQuestions or JobDetail */}
          {jobs?.questions?.length ? (
            <JobQuestions questions={jobs?.questions} />
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
          {lead?.isAccepted ?
            <div className="md:flex justify-between items-center bg-surface p-4 rounded-lg shadow-md border border-neutral-200">
              <div className="flex flex-col md:flex-row md:items-center">
                <span className="font-semibold text-xl md:text-2xl text-neutral-800 md:mr-5 mb-3 md:mb-0"><i>Your Quoted price is</i></span>
              </div>
              <div className="relative flex text-ink-inverse items-center bg-accent font-semibold text-2xl rounded-md px-3 py-2 md:w-52 w-full">
                <i className='text-ink-inverse'>Per Hour &nbsp;&nbsp;</i>
                <span className="text-ink-inverse">â‚¬</span>
                {lead?.quotePrice}
              </div>

            </div>
            :
            <div className="md:flex justify-between items-center bg-surface p-4 rounded-lg shadow-md border border-neutral-200">
              <div className="flex flex-col md:flex-row md:items-center">
                <span className="font-semibold text-xl md:text-2xl text-neutral-800 md:mr-5 mb-3 md:mb-0">Quote your price <span className="text-accent text-sx ml-2"><i>Per Hour</i></span></span>
                <div className="relative flex items-center bg-neutral-100 rounded-md px-3 py-2 md:w-60 w-full">
                  <span className="text-muted-foreground">â‚¬</span>
                  <input
                    id='price'
                    type="number"
                    defaultValue={lead?.quotePrice}
                    placeholder="Enter your price"
                    className="ml-2 flex-grow bg-transparent outline-none text-neutral-800"
                  />
                </div>

              </div>
              {isLoading ?
                <Button className="bg-accent text-accent-foreground w-full md:w-auto mt-4 md:mt-0 hover:bg-accent/90 hover:text-ink-inverse px-6 py-2 rounded-md transition-all duration-200">
                  <Spinner />
                </Button>
                :
                <Button onClick={() => { sendQuote(lead) }} className="bg-accent text-accent-foreground w-full md:w-auto mt-4 md:mt-0 hover:bg-accent/90 hover:text-ink-inverse px-6 py-2 rounded-md transition-all duration-200">
                  Send Quote
                </Button>
              }
            </div>
          }

        </div>
      </div>
    </div>
  );
};

export default Page;
