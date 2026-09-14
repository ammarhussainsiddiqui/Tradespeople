'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import serviceIcon from '../../app/assets/step1.webp';
import { MapPin } from 'lucide-react';

const Step2 = ({ handleChange, handleSubmit }) => {
  const [value, setValue] = useState("");

  const handlePostcodeChange = (e) => {
    const { name, value } = e.target;
    setValue(value)

  };
  useEffect(() => {
    handleChange(value);
  }, [value])


  return (
    <>

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
                className="w-34 text-xs px-4 py-2 border-none focus:ring-0 middle uppercase"
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Step2;
