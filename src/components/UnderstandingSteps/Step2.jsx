'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import serviceIcon from '../../app/assets/step1.webp';
import { MapPin } from 'lucide-react';
import { isValidUKPostalCode } from '../../utils/functions';
import { toast } from "react-toastify";
import * as Sentry from '@sentry/nextjs';

import { useGlobalState } from '../../app/context/GlobalStateContext';
const Step2 = ({ router }) => {
  const [value, setValue] = useState("");

  const { understand, setUnderstandState } = useGlobalState();
  const handlePostcodeChange = (e) => {
    setValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      Continue();
    }
  };

  const Continue = () => {
    const isPostalValid = isValidUKPostalCode(value);
    if (!isPostalValid) {
      toast.error('Invalid postcode', {
        position: "top-center",
      });
    }

    if (isPostalValid) {
      try {
        const storageData = understand;
        storageData.postcode = value;
        setUnderstandState(storageData)
        router.push('/login/find-matches');
      } catch (error) {
        Sentry.captureException("Failed to parse localStorage data:", error);
      }
    }
  };

  return (
    <>

      <div className="max-h-screen h-auto mt-14 flex flex-col items-center justify-center mb-10">
        <div className="w-full max-w-md px-8 py-6 bg-surface rounded-lg shadow-md border border-neutral-200">
          <div className="flex flex-col items-center justify-center space-y-4 relative">
            <Image src={serviceIcon} alt="Service Icon" width={100} height={100} />
            <div className="text-left w-full">
              <label htmlFor="service-search" className="text-md font-semibold text-ink-soft">
                Please provide your postcode.
              </label>
              <p className="text-muted-foreground text-xs">
                To find tradesperson in your area, we need to know where you are located.
              </p>
            </div>

            <div className="flex flex-col items-stretch w-full max-w-md relative">
              <div className="flex items-center border border-neutral-300 rounded-md overflow-hidden mb-1">
                <div className="flex items-center border-l border-neutral-300 pl-4">
                  <MapPin className="text-ink-muted h-4 w-4 mr-2" />
                  <input
                    id="postcode"
                    name="postcode"
                    type="text"
                    placeholder="E.g. NE37 9HW"
                    onChange={handlePostcodeChange}
                    onKeyDown={handleKeyDown}
                    className="w-34 text-xs px-4 py-2 border-none focus:ring-0 middle uppercase"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 mb-4 flex justify-between">
        <button
          onClick={() => { window.history.back(); }}
          className="px-4 py-2 bg-neutral-300 text-ink-soft rounded-md flex items-center"
        >
          Back
        </button>
        <button
          onClick={Continue}
          className="px-4 py-2 bg-accent text-accent-foreground hover:bg-primary hover:text-ink-inverse rounded-md flex items-center"
        >
          Continue
        </button>
      </div>

    </>
  );
};

export default Step2;
