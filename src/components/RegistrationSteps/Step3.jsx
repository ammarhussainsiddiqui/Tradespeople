import React from 'react';
import { Phone } from 'lucide-react';

const Step3 = ({ data, handleChange }) => {
  return (

    <div>
      <label htmlFor="phone" className="block text-xl font-semibold text-ink-soft py-0 text-center">
        Your number is safe with us.
        <br />
        <span className='text-xs text-center text-muted-foreground font-normal'>Some matches prefer to provide quotes over the phone to get more details.</span>
      </label>
      <span className="text-xs text-muted-foreground">Phone Number</span>
      <div className="relative mt-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Phone className="text-ink-muted" />
        </div>
        <input
          id="phone"
          name="phone"
          type="number"
          required
          placeholder="Enter your Phone Number"
          value={data.phone}
          onChange={handleChange}
          className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
        />
      </div>
    </div>
  );
};

export default Step3;
