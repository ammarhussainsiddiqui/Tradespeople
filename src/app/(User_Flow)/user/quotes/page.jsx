'use client';

import React, { useEffect, useState } from 'react';
import QuotesCard from '../../../../components/QuotesCard';
import Image from 'next/image';
import magnificationIcon from '../../../assets/magnificationIcon.webp';
import Link from 'next/link';
import { Button } from '../../../../components/ui/button';
import JobCard from '../../../../components/JobCard';
import { getUserDetails } from '../../../../actions/auth';
import { useGlobalState } from '../../../../app/context/GlobalStateContext';
const Page = () => {
  const [loading, setLoading] = useState(true);
  const [tradespersons, setTradespersons] = useState([]);
  const [filteredTradespersons, setFilteredTradespersons] = useState([]);
  const [error, setError] = useState(null);
  const [cached, setCached] = useState(null);
  const { detailCache, setdetailCache } = useGlobalState();

  // Utility function to fetch data with retries
  const fetchWithRetry = async (url, options = {}, retries = 3) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      if (retries > 0) {
        return fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  };

  const getTradePeoples = async (data) => {
    setLoading(true);
    setError(null);
    const user = await getUserDetails();
    try {
      const response = await fetchWithRetry(`/api/get-quotes?jobId=${data.job.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (response.success) {
        const quotes = response?.quotes;

        setFilteredTradespersons(quotes);  // Set filtered tradespersons with the fetched quotes
      }
    } catch (error) {
      setError('Error fetching tradespersons data.');

    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    const fetchProfile = async () => {
      const cachedData = detailCache;
      if (cachedData) {
        setCached(cachedData);
        getTradePeoples(cachedData);  // Fetch tradespersons based on cached job data
      }
    };

    fetchProfile();
  }, []);



  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className='bg-muted md:p-4 w-screen'>


      <div className="max-w-7xl mx-auto md:px-4 sm:px-6 lg:px-8 bg-muted">
        <div className='flex justify-between mb-4 w-full'>
          <span className='md:text-2xl font-semibold text-md mt-2 ml-2 md:mt-0 md:ml-0 w-2/3 md:w-3/4'> Job Requirements </span>
          <Link className='p-0 pt-1 md:pt-1' href={'/user/addjob'}>
            <Button className='bg-accent px-6 hover:bg-primary hover:text-ink-inverse text-accent-foreground'>
              Post a new job
            </Button>
          </Link>
        </div>

        {/* Job Card Display */}
        {!cached?.isCompleted ? <JobCard isCompleted={cached?.isCompleted} job={cached?.job} /> : ''}

        {/* Display if filtered tradespersons are available */}
        {filteredTradespersons.length > 0 && (
          <>
            <div className='flex justify-between mb-8 mt-2 w-full'>
              <span className='md:text-2xl font-semibold text-xs w-2/3 md:w-3/4'>
                We have received the following quotes from different tradespersons
              </span>
            </div>
          </>
        )}

        {/* Main Content */}
        <div className='mt-4'>
          {loading ? (
            <div className="w-8 h-8 border-4 border-t-accent border-r-accent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          ) : error ? (
            <div className="flex pb-4 justify-center items-center w-full">
              <div className="bg-surface p-8 rounded-lg w-[60%] shadow-md text-center">
                <h2 className="text-xl font-semibold mb-2">Error</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Link href='/user/hireTradesperson' className="bg-accent text-accent-foreground px-6 py-2 rounded-md hover:bg-accent/90" onClick={handleReload}>
                  Try Again
                </Link>
              </div>
            </div>
          ) : filteredTradespersons.length > 0 ? (
            <>
              {/* Display the list of quotes */}

              <QuotesCard profiles={filteredTradespersons} />
            </>
          ) : (
            <div className="flex pb-4 justify-center items-center w-full">
              <div className="bg-surface p-8 rounded-lg w-[60%] shadow-md text-center">
                <div className="flex justify-center items-center mb-4">
                  <div className="bg-accent text-accent-foreground rounded-full p-2">
                    <Image src={magnificationIcon} alt="Magnification Icon" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold mb-2">Quotes not available for your job.</h2>
                <p className="text-muted-foreground mb-4">Tradepersons have not quoted yet.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
