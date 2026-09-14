'use client';
import React, { useEffect, useState } from 'react';
import { getUserDetails } from '../../../../actions/auth';
import PopupSpinner from '../../../../components/PopupSpinner';
import { ArrowLeft } from 'lucide-react';
import InterestedTradespersons from '../../../../components/(User_flow)/InterestedTradespersons';
import TradespersonProfile from '../../../../components/(User_flow)/TradepersonProfile';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

const Page = () => {
  const [loading, setLoading] = useState(false);
  const [tradespersons, setTradespersons] = useState([]);
  const [selectedPersonId, setSelectedPersonId] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const query = new URLSearchParams(window.location.search);
      const tradepersons = query.get('tradepersons');
      if (tradepersons) {
        getTradePeoples(tradepersons);
      }
    }
  }, []);

  const getTradePeoples = async (id) => {
    setLoading(true);
    const user = await getUserDetails();
    try {
      const response = await fetch(`/api/tradePeoples?ids=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tradespersons data');
      }

      const data = await response.json();
      if (data.success) {

        setTradespersons(data.data);
        setSelectedPersonId(data.data[0]?.id); // Set the initial selected person
      }
    } catch (error) {
      Sentry.captureException('Error fetching tradespersons data:', error);
    }
    finally {
      setLoading(false);
    }
  };

  const handleSelectPerson = (id) => {
    setSelectedPersonId(id);
  };

  const selectedPerson = tradespersons.find(person => person.id === selectedPersonId);

  return (
    <div className='bg-muted mt-2 md:mt-0 md:p-4 mb-4 w-screen'>
      <PopupSpinner isVisible={loading} />
      <div className="max-w-7xl mx-auto md:px-4 sm:px-6 lg:px-8 bg-muted">
        <h1 className='flex text-xl font-bold mb-5 mt-2'>
          <Link href={'/user/myjobs'}>
            <ArrowLeft />
          </Link>
          &nbsp; My Jobs
        </h1>
        <div className="md:flex gap-4">
          <div className="md:w-1/3">
            <InterestedTradespersons
              tradespersons={tradespersons}
              onSelectPerson={handleSelectPerson}
              selectedPersonId={selectedPersonId}
            />
          </div>
          <div className="md:w-2/3 mt-4 md:mt-0">
            <TradespersonProfile profile={selectedPerson} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
