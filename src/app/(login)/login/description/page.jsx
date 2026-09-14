'use client';
import React, { useState, useEffect } from 'react';
import Progress from '../../../../components/Progress';
import { useRouter } from 'next/navigation';
import InjectedStepOut from '../../../../components/UnderstandingSteps/InjectStepOut';
import { useGlobalState } from '../../../context/GlobalStateContext';
const Page = () => {
  const router = useRouter();
  const { serviceName, setserviceName } = useGlobalState();
  useEffect(() => {
    if (serviceName) {
      setserviceName(serviceName);
    }
  }, [serviceName, setserviceName]);

  return (
    <div className="content  w-screen px-4 sm:px-6 lg:px-8 bg-muted">
      <div className='w-screen md:px-10 '>
        <div className='flex flex-col xl:text-center md:text-center justify-between'>
          <h2 className="mt-4 text-2xl font-semibold text-ink-soft">Post a job for FREE
            <>
              {serviceName ? ` (${serviceName})` : ''}
            </>
          </h2>
          <p className='text-sm'>Get responses from screened and reviewed tradespersons near you</p>
        </div>
        <div className='mt-4 mb-10'>
          <Progress currentStep={2} totalSteps={3} />
          <p className="mt-5 text-sm text-muted-foreground text-right">Step {2}/{3}</p>
        </div>
        <InjectedStepOut router={router} />
      </div>
    </div>
  );
};

export default Page;
