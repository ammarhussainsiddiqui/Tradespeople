'use client'
import React, { useState } from 'react';
import { toast } from "react-toastify";
import { useGlobalState } from '../../app/context/GlobalStateContext';
const InjectedStepOut = ({ router }) => {
  const [value, setValue] = useState("");
  const { understand, setUnderstandState } = useGlobalState();
  const [formData, setFormData] = useState({});
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function containsContactInfo(text) {
    // Regex patterns for emails and phone numbers
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phonePattern = /\b(\+?\d{1,3}?[-.\s]?)(\(?\d{1,4}\)?[-.\s]?)?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b/;
    const contactWords = ["contact", "reach me", "email me", "phone"];

    // Search for emails and phone numbers
    if (emailPattern.test(text) || phonePattern.test(text)) {
      return true;
    }

    // Search for contact-related words
    for (let word of contactWords) {
      if (text.toLowerCase().includes(word.toLowerCase())) {
        return true;
      }
    }

    return false;
  }


  const Continue = () => {

    if (formData?.description !== "" && formData?.headline !== "" && formData?.description !== undefined && formData?.headline !== undefined) {
      const wordCount = formData?.description.trim().length;
      const wordCountHeadline = formData?.headline.trim().length;
      if (wordCount >= 5 && wordCount <= 250) {
        if (wordCountHeadline >= 1 && wordCountHeadline <= 100) {
          const resultOfDescription = containsContactInfo(formData?.description)
          const resultOfHeadline = containsContactInfo(formData?.headline)
          if (!resultOfDescription && !resultOfHeadline) {
            let localStorageData = understand;
            localStorageData.description = formData?.description;
            localStorageData.headline = formData?.headline;
            setUnderstandState(localStorageData)
            router.push('/login/post-code');
          }
          else {
            toast.error('Headline must be between 1 and 100 characters.', {
              position: "top-center",
            });
          }

        }
        else {
          toast.error('Sharing contact details is not permitted in this section. Please refrain from including personal contact information!', {
            position: "top-center",
          });
        }

      } else {
        toast.error('Description must be between 5 and 250 characters.', {
          position: "top-center",
        });
      }

    } else {
      toast.error('Headline & Description both are required!', {
        position: "top-center",
      });
    }

  }

  return (
    <>
      <div className="flex flex-col items-center justify-center space-y-4 relative  mt-4">
        {/* Job Headline Field */}
        <div className="w-full max-w-2xl bg-surface p-4 rounded-lg">
          <label htmlFor="headline" className="text-lg font-semibold text-neutral-800">
            Give your job a headline<span className="text-destructive">*</span>
          </label>
          <p className="text-sm text-muted-foreground">
            More tradesperson express interest in jobs that have a descriptive name
          </p>
          <input
            onChange={handleChange}
            id="headline"
            name='headline'
            placeholder="Write headline here"
            className="w-full mt-4 p-3 bg-neutral-100 text-sm border border-neutral-300 rounded-lg text-ink-soft resize-none focus:outline-none focus:border-accent"
          // rows="1"
          ></input>
        </div>

        {/* Job Description Field */}
        <div className="w-full max-w-2xl bg-surface p-4 rounded-lg">
          <label htmlFor="description" className="text-lg font-semibold text-neutral-800">
            Add description to your job<span className="text-destructive">*</span>
          </label>
          <p className="text-sm text-muted-foreground">
            Include any details you think the tradesperson should know (approx. length needed, timeframe, etc.)
          </p>
          <textarea
            onChange={handleChange}
            id="description"
            name="description"
            placeholder="Write something here"
            className="w-full mt-4 p-3 bg-neutral-100 border border-neutral-300 text-sm rounded-lg text-ink-soft resize-none focus:outline-none focus:border-accent"
            rows="5"
          ></textarea>
        </div>

      </div>
      <div className="mt-2 mb-4 flex justify-between">
        <button
          onClick={() => { window.history.back() }}
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

export default InjectedStepOut;
