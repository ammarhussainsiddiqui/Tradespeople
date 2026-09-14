'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import serviceIcon from '../../app/assets/step1.webp';
import { MapPin } from 'lucide-react';
import { isValidUKPostalCode } from '../../utils/functions';
import { toast } from "react-toastify";

const InjectStep = ({ handleChangeDescription, handleChangeHeadline }) => {
  const [value, setValue] = useState("");
  const [valueHeadline, setValueHeadline] = useState("");

  const handleDescriptionChange = (e) => {
    const { name, value } = e.target;
    setValue(value)

  };


  const handleHeadlineChange = (e) => {
    const { name, value } = e.target;
    setValueHeadline(value)

  };
  useEffect(() => {
    handleChangeDescription(value);
  }, [value])

  useEffect(() => {
    handleChangeHeadline(valueHeadline);
  }, [valueHeadline])


  return (
    <>

      <div className="flex flex-col items-center justify-center space-y-4 relative">
        {/* Job Headline Field */}
        <div className="w-full  bg-surface p-4 rounded-lg">
          <label htmlFor="headline" className="text-lg font-semibold text-neutral-800">
            Give your job a headline<span className="text-destructive">*</span>
          </label>
          <p className="text-sm text-muted-foreground">
            More tradesperson express interest in jobs that have a descriptive name
          </p>
          <input
            onChange={handleHeadlineChange}
            id="headline"
            placeholder="Write headline here"
            className="w-full mt-4 p-3 bg-neutral-100 text-sm border border-neutral-300 rounded-lg text-ink-soft resize-none focus:outline-none focus:border-accent"
          // rows="1"
          ></input>
        </div>

        {/* Job Description Field */}
        <div className="w-full  bg-surface p-4 rounded-lg">
          <label htmlFor="description" className="text-lg font-semibold text-neutral-800">
            Add description to your job<span className="text-destructive">*</span>
          </label>
          <p className="text-sm text-muted-foreground">
            Include any details you think the tradesperson should know (approx. length needed, timeframe, etc.)
          </p>
          <textarea
            onChange={handleDescriptionChange}
            id="description"
            placeholder="Write something here"
            className="w-full mt-4 p-3 bg-neutral-100 border border-neutral-300 text-sm rounded-lg text-ink-soft resize-none focus:outline-none focus:border-accent"
            rows="5"
          ></textarea>
        </div>

      </div>

    </>
  );
};

export default InjectStep;
