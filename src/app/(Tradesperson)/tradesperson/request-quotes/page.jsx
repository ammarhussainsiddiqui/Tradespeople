'use client';

import React, { useState, useEffect } from 'react';
import { Edit3, List, MapPin, Clock } from 'lucide-react';
import magnifactionIcon from '../../../assets/magnificationIcon.webp';
import { getUserDetails } from '../../../../actions/auth';
import Image from 'next/image';
import UserImage from '../../../assets/userImage.webp'
import { Button } from '../../../../components/ui/button';
import { useRouter } from 'next/navigation';

import * as Sentry from '@sentry/nextjs';

import { useGlobalState } from '../../../../app/context/GlobalStateContext';


const Page = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [noRequestStatus, setNoRequestStatus] = useState(false);
  const { qouteCache, setqouteCache } = useGlobalState();
  const cacheName = 'quote-cache';

  const encryptData = async (data) => {
    setqouteCache(data)
    router.push(`/tradesperson/requested-user-details`);
  };

  // Fetch quotes and services
  const getQuotes = async () => {
    setLoading(true); // Set loading state
    const user = await getUserDetails();
    if (!user.id) return; // Exit if user is not found

    try {

      // Fetch the quotes for the tradesperson
      const response = await fetch(`/api/get-quote-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        cache: "no-cache",
        body: JSON.stringify({ tradepersonId: user?.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quotes');
      }

      const data = await response.json();

      // Fetch corresponding service data for each quote
      const updatedQuotes = await Promise.all(
        data.quotes.map(async (quote) => {
          try {
            const response = await fetch(`/api/get-service?serviceId=${quote?.job?.job?.services}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`,
              },
            });

            if (!response.ok) throw new Error('Failed to fetch service data');

            const serviceData = await response.json();

            if (serviceData.success) {
              return { ...quote, servicedata: serviceData?.service?.type };
            }
          } catch (error) {
            Sentry.captureException('Error fetching service data:', error);
          }

          return quote; // Return original quote if fetch fails
        })
      );


      setQuotes(updatedQuotes);
    } catch (error) {
      Sentry.captureException('Error fetching quotes:', error);
    } finally {
      setLoading(false); // Ensure loading state is turned off
    }
  };

  useEffect(() => {
    getQuotes(); // Fetch quotes on component mount
  }, []);

  return (
    <div className="bg-muted p-4  my-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-muted">
        <h2 className="text-2xl font-bold mb-6 mt-4">Requests for Quotes</h2>

        <div className="space-y-4">


          {loading ? (
            <div className="pb-5 h-[178px] flex items-center justify-center">
              <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-accent border-r-accent border-b-transparent border-l-transparent"></div>
            </div>
          ) : (
            <>
              {quotes.length == 0 ?
                <div className="flex pb-4 justify-center w-50 items-center">
                  <div className="bg-surface p-8 rounded-lg w-[60%] shadow-md text-center">
                    <div className="flex justify-center items-center mb-4">
                      <div className="bg-accent text-accent-foreground rounded-full">
                        <Image src={magnifactionIcon} alt="Magnification Icon" />
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No Requests</h2>
                    <p className="text-muted-foreground mb-4">
                      Add your service details and location in lead settings to receive tailored requests and job opportunities from clients in your area.
                    </p>
                  </div>
                </div>
                :
                <>
                  {quotes.map((quote, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-r-2 border-accent rounded-lg bg-surface shadow-sm mb-4"
                    >
                      <Image className="mr-4 rounded-lg" width={90} height={90} src={quote?.user?.profileUrl || UserImage} alt="Profile" />
                      <div className="flex-1 mb-4 md:mb-0">
                        <h3 className="text-lg font-semibold">{quote?.servicedata || 'Service Request'} <i className='text-success'>{quote?.isAccepted ? '( Accepted )' : ''}</i></h3>
                        <p className="text-sm text-muted-foreground">
                          Requested By • {quote?.user?.firstName} {quote?.user?.lastName}
                        </p>
                        <div className="flex flex-wrap items-center space-x-4 mt-2 text-sm">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4 text-accent" />
                            <span>{quote?.job?.job?.postcode}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-accent" />
                            <span>{new Date(quote?.job?.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      {quote?.isAccepted ?
                        <Button onClick={() => { encryptData(quote) }} className="bg-success hover:bg-success/90 text-success-foreground px-8 py-2 rounded-md w-full md:w-auto">
                          &nbsp;&nbsp;Contact&nbsp;&nbsp;
                        </Button>
                        :
                        <Button onClick={() => { encryptData(quote) }} className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-2 rounded-md w-full md:w-auto">
                          {quote?.quotePrice !== null ? 'Edit Quote' : 'Send Quote'}
                        </Button>
                      }
                    </div>
                  ))}
                </>
              }
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;