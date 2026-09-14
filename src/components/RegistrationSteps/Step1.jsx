import React from 'react';
import { Mail } from 'lucide-react';

const Step1 = ({ data, handleChange }) => {
  return (
    <div>
      <label htmlFor="email" className="block text-xl  font-semibold text-ink-soft py-0 text-center">
        Please provide your email address.
      </label>
      <div className='w-full text-center pb-2'>
        <span className='text-xs text-muted-foreground'>
          We will only share your email address to the interested tradesperson.
        </span>

      </div>
      <div className="relative mt-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Mail className="text-ink-muted h-4 w-4" />
        </div>
        <input
          id="email"
          name="email"
          type="text"
          required
          placeholder="Enter your Email Address"
          value={data.email}
          onChange={handleChange}
          className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent text-sm md:text-md"
        />
      </div>
    </div>
  );
};

export default Step1;
