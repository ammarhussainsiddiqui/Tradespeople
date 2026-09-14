'use client';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getUserDetails } from '../../actions/auth';
import Link from 'next/link';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ChevronUp, ChevronDown } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';
const Progress = () => {
  const pathname = usePathname();
  const [userData, setUserData] = useState(null);
  const [aboutCompleted, setAboutCompleted] = useState(false);
  const [leadsCompleted, setLeadsCompleted] = useState(false);
  const [accountDetailsCompleted, setAccountDetailsCompleted] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isExpanded, setIsExpanded] = useState(false);

  const completeness = (aboutCompleted ? 50 : 0) + (accountDetailsCompleted ? 50 : 0);

  const fetchUserData = async (effectiveUserId) => {
    const jwtuser = await getUserDetails();
    try {
      const response = await fetch('/api/get-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwtuser?.token}` },
        body: JSON.stringify({ id: effectiveUserId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      let valueOfProgress = 100;
      const isMatch = await bcrypt.compare('00000', data?.user?.password);

      if (isMatch) {
        valueOfProgress -= 50;
      }

      if (data.success) {
        if (data.user.profileUrl && data.user.firstName && data.user.lastName && data.user.phone) {
          setAboutCompleted(true);
        } else {
          valueOfProgress -= 50;
        }

        setProgress(valueOfProgress);

        const servicesResponse = await fetch(`/api/save-trade-service?userId=${effectiveUserId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwtuser?.token}` },
        });

        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          if (servicesData.success && servicesData.services.length > 0) {
            const locationsResponse = await fetch(`/api/save-trade-location?userId=${effectiveUserId}`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwtuser?.token}` },
            });

            if (locationsResponse.ok) {
              const locationsData = await locationsResponse.json();
              if (locationsData.success && locationsData.tradeLocations.length > 0) {
                setLeadsCompleted(true);
              }
            }
          } else {
            setLeadsCompleted(false);
          }
        }
      }
    } catch (error) {
      Sentry.captureException('Error fetching user data:', error);
    }
  };

  const getUser = async () => {
    try {
      const user = await getUserDetails();
      setUserData(user);

      if (user.id) {
        setAccountDetailsCompleted(!user.fresh);
        await fetchUserData(user.id);
      }
    } catch (error) {
      Sentry.captureException('Error getting user details:', error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <>
      {progress !== 100 && (
        <div className="bg-surface rounded-2xl">
          <div className="bg-surface p-4 rounded-2xl">
            <div className="flex items-center justify-between text-xl font-semibold mb-2">
              <span>Your profile is incomplete</span>
              <button
                onClick={toggleExpand}
                className="block md:hidden my-auto"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            {(isExpanded || window.innerWidth >= 768) && (
              <>
                <div className="relative pt-1 w-full">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-neutral-200">
                    <div
                      style={{ width: `${progress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-ink-inverse justify-center bg-accent"
                    >
                      <span
                        className="text-foreground text-xs px-2"
                        style={{ transform: `translateX(-20%)`, position: 'absolute', left: `${progress}%` }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="currentColor"
                          className="bi bi-check-circle-fill"
                          viewBox="0 0 16 16"
                        >
                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08 0L7 8.939 5.781 7.72a.75.75 0 0 0-1.06 1.06L6.44 10.56a.75.75 0 0 0 1.08 0l4.47-4.47a.75.75 0 0 0 0-1.06z" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs mt-4">
                  Take two minutes to improve your profile. This increases the chance to get more leads.
                </div>
              </>
            )}
          </div>
          {(isExpanded || window.innerWidth >= 768) && (
            <div className='pb-3'>
              {pathname !== '/tradesperson/profile' && (
                <Link href={'/tradesperson/profile'}>
                  <button
                    type="button"
                    className="py-2 px-8 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-primary hover:text-ink-inverse focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-0 ml-4"
                  >
                    Complete
                  </button>
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Progress;
