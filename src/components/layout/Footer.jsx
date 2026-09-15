'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Copyright from './Copyright';
import Logomark from './Logomark';
import { validateToken } from '../../actions/auth';
import { toast } from "react-toastify";

const Footer = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    validateToken();
  })

  return (
    <footer className="mt-0">
      <div className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-10 justify-between">
            <div className="mb-6 md:mb-0 md:w-[40%] w-[70%] ">
              <Link href="/">
                <Logomark className="h-10 w-10" inverted />
              </Link>
              <p className="mt-3 text-left text-sm w-60 md:w-full text-primary-foreground/70">
                Connecting you with top-rated tradespeople in your area.
              </p>
            </div>

            <div className="grid md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1 justify-between w-full  text-left">
              <div >
                <ul>
                  <li className="mb-3">
                    <a href="https://tradepeople.co.uk/how-it-works/" target='_blank' className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">How it works</a>
                  </li>
                  <li className="mb-3">
                    <a href="https://tradepeople.co.uk/about/" target='_blank' className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">About Us</a>
                  </li>
                  <li className="mb-3">
                    <a href="https://tradepeople.co.uk/help-center/" target='_blank' className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">Help Center</a>
                  </li>
                </ul>
              </div>
              <div>
                <ul>
                  <li className="mb-3">
                    <a href="https://tradepeople.co.uk/blogs/" target='_blank' className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">Blog</a>
                  </li>
                  <li className="mb-3">
                    <a href="https://tradepeople.co.uk/quality-standard/" target='_blank' className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">Quality Standards</a>
                  </li>
                  <li className="mb-3">
                    <a href={`${process.env.NEXT_PUBLIC_URL}/login/join-tradesperson`} target='_blank' className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                      Tradesperson
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <ul>
                  <li className="mb-3">
                    <a href="https://tradepeople.co.uk/privacy-policy/" target='_blank' className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">Privacy Policy</a>
                  </li>
                  <li className="mb-3">
                    <a href="https://tradepeople.co.uk/cookies-policy/" target='_blank' className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">Cookies Policy</a>
                  </li>
                  <li className="mb-3">
                    <a href="https://tradepeople.co.uk/terms-and-conditions/" target='_blank' className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">Terms & Conditions</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border bg-muted block md:hidden">
        <div className="flex flex-col md:flex-row justify-between text-muted-foreground text-sm">
          <div className="p-2">
            <p>© Copyright {new Date().getFullYear()}. All Rights Reserved</p>
          </div>
        </div>
      </div>
      <div className="bg-transparent py-0 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Copyright />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
