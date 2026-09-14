'use client';

import React, { useEffect, useState } from 'react';
import CradFull from '../../../../components/CradFull';
import Image from 'next/image';
import magnificationIcon from '../../../assets/magnificationIcon.webp';
import Link from 'next/link';
import { Button } from '../../../../components/ui/button';
import JobCard from '../../../../components/JobCard';
import { getUserDetails } from '../../../../actions/auth';
import * as Sentry from '@sentry/nextjs';
import { useGlobalState } from '../../../../app/context/GlobalStateContext';

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [tradespersons, setTradespersons] = useState([]);
  const [filteredTradespersons, setFilteredTradespersons] = useState([]);
  const [error, setError] = useState(null);
  const [cached, setCached] = useState(null);
  const { detailCache, setdetailCache } = useGlobalState();

  // Utility function to fetch data with retries
  const fetchWithRetry = async (url, options = {}, retries = 2) => {
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

  const getTradePeoples = async (jobData) => {
    setLoading(true);
    setError(null);
    const jwtuser = await getUserDetails();
    try {
      // Fetch tradepeople data
      const data = await fetchWithRetry('/api/get-tradeperson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtuser?.token}`,
        },
      });

      if (data.success) {
        const query = new URLSearchParams(window.location.search);
        const filterTrade = query.get('trade')?.toLowerCase();
        const filterTradeService = query.get('tradeService')?.toLowerCase();
        const trades = data.data;

        // Fetch quotes for each tradeperson
        const tradepeopleWithQuotes = await Promise.all(
          trades.map(async (person) => {

            const quoteResponse = await fetchWithRetry(`/api/get-quote`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtuser?.token}`,
              },
              cache: "no-cache",
              body: JSON.stringify({ userId: jobData?.job?.userId, tradepersonId: person.id, jobId: jobData?.jobId }),
            });

            // Attach quote data to the tradeperson
            return {
              ...person,
              quote: quoteResponse.quote,
            };
          })
        );

        // Apply filters
        const filtered = tradepeopleWithQuotes.filter((person) => {
          const tradeMatch = filterTrade ? person.trade?.toLowerCase() === filterTrade : true;
          const tradeServiceMatch = filterTradeService ? person.tradeService?.some(service => service.Service.type?.toLowerCase() === filterTradeService) : true;

          return tradeMatch || tradeServiceMatch;
        });

        setFilteredTradespersons(filtered);
        setTradespersons(tradepeopleWithQuotes);
      }
    } catch (error) {
      setError('Error fetching tradespersons data.');
      Sentry.captureException('Error fetching tradespersons data:', error);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    const fetchProfile = async () => {
      const cached = detailCache
      if (cached) {
        setCached(cached);
      }
      getTradePeoples(cached);
    };

    fetchProfile();
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className='bg-muted md:p-4 p-2 w-screen'>


      <div className="max-w-7xl mx-auto  bg-muted">
        <div className='flex justify-between mb-4 w-full'>
          <span className='md:text-2xl font-semibold mt-2 ml-2 text-md w-2/3 md:w-3/4'> Job  Requirements </span>
          <Link className='p-0 pt-1 md:pt-1' href={'/user/addjob'}>
            <Button className='bg-accent px-6 hover:bg-primary hover:text-ink-inverse text-accent-foreground'>
              {/* <Plus size={20} />  */}
              Post a new job
            </Button>
          </Link>
        </div>
        {!cached?.isCompleted ? <JobCard isCompleted={cached?.isCompleted} job={cached?.job} /> : ''}
        {filteredTradespersons.length != 0 ?
          <>
            <div className='flex justify-between mb-8 mt-2 w-full'>
              <span className='md:text-2xl font-semibold  text-xs w-full md:w-3/4 mt-4'> We found following tradespersons matching your criteria </span>
            </div>
          </>
          :
          ''
        }
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
            <CradFull profiles={filteredTradespersons} />
          ) : (
            <div className="flex pb-4 justify-center items-center w-full">
              <div className="bg-surface p-8 rounded-lg w-[60%] shadow-md text-center">
                <div className="flex justify-center items-center mb-4">
                  <div className="bg-accent text-accent-foreground rounded-full p-2">
                    <Image src={magnificationIcon} alt="Magnification Icon" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold mb-2">Tradesperson not available for your job.</h2>
                <p className="text-muted-foreground mb-4">If you want to see all tradesperson,</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
