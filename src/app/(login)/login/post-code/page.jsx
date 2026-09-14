'use client';
import React, { useState, useEffect } from 'react';
import Progress from '../../../../components/Progress';
import { useRouter } from 'next/navigation';
import Step2 from '../../../../components/UnderstandingSteps/Step2';
import { useGlobalState } from '../../../../app/context/GlobalStateContext';
const Page = () => {
  const router = useRouter();
  const [serviceName, setServiceName] = useState('')
  const { servicename, setservicename } = useGlobalState();
  const useRedirectIfEmpty = () => {
    useEffect(() => {
      if (servicename === undefined) return;

      if (!servicename || Object.keys(servicename).length === 0) {
        router.push('/login/hire-tradesperson');
      }
    }, [servicename, router]);
  };

  useRedirectIfEmpty();

  useEffect(() => {
    let serviceNames = servicename;
    setservicename(serviceNames);
  })

  return (
    <div className="content max-w-7xl mx-auto w-screen px-4 sm:px-6 lg:px-8 bg-muted">
      <div className='w-screen'>
        <div className='flex flex-col xl:text-center md:text-center justify-between'>
          <h2 className="mt-4 text-2xl font-semibold text-ink-soft">Post a job for FREE
            <>
              {serviceName ? ` (${serviceName})` : ''}
            </>
          </h2>
          <p className='text-sm'>Get responses from screened and reviewed tradespersons near you</p>
        </div>
        <div className='mt-4 mb-10'>
          <Progress currentStep={3} totalSteps={3} />
          <p className="mt-5 text-sm text-muted-foreground text-right">Step {3}/{3}</p>
        </div>
        <Step2 router={router} />
      </div>
    </div>
  );
};

export default Page;
