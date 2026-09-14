"use client"
import React, { useState } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
const MainTitle = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    isVisible && (
      <div className='bg-primary justify-center w-full text-primary-foreground text-xs h-11 md:text-sm p-2 flex items-center justify-center relative'>
        <span className='truncate'>
          Are you a Tradesperson looking for local leads? <Link className='text-ink-inverse' href={'/login/join-tradesperson'}> <span> <u> Join Now</u></span></Link>
        </span>
      </div>
    )
  );
};

export default MainTitle;
