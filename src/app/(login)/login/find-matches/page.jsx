'use client';
import React, { useEffect, useState } from 'react';
import CardDummy from '../../../../components/CardDummy';
import { getUserDetails } from '../../../../actions/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import Image from 'next/image';
import tick from '../../../assets/tick-circle.webp';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useGlobalState } from '../../../../app/context/GlobalStateContext';
const Page = () => {

  const [isCompleteReg, setIsCompleteReg] = useState(false);
  const [showFirstDialog, setShowFirstDialog] = useState(true);
  const [showSecondDialog, setShowSecondDialog] = useState(false);
  const router = useRouter();
  const { understand, setUnderstandState } = useGlobalState();

  const useRedirectIfEmpty = () => {
    useEffect(() => {
      if (!understand || Object.keys(understand).length === 0) {
        router.push('/login/hire-tradesperson');
      }
    }, [understand, router]);
  };
  useRedirectIfEmpty();
  const profiles = [
    {
      id: 1,
      name: "John Philips",
      location: "The Convent Garden, London",
      title: "Plumbing Inspector | Master Plumber | Commercial Plumber",
      distance: "2 miles away from Fareham",
      rating: "5/5 (5 reviews)",
      jobSuccess: "100% Job Success",
      skills: [
        "Pipe Installation and Repair",
        "Blueprint Reading",
        "Pipe Fitting and Welding",
        "Fixture Installation",
        "Leak Detection and Repair"
      ],
      testimonial: "I was nervous about finding the right contractor for our home renovation, but this platform made it so easy. Within hours, I received quotes from several qualified tradesperson. The work was completed on time and exceeded our expectations. Highly recommend!",
      image: "https://media.licdn.com/dms/image/D4D12AQHzRiscJOGisQ/article-cover_image-shrink_600_2000/0/1697452207174?e=2147483647&v=beta&t=-LI108Mcn7TG96ay5pe80Qi7niZgXYS3sHJHgOGVLw0",
    },
    {
      id: 2,
      name: "John Philips",
      location: "The Convent Garden, London",
      title: "Plumbing Inspector | Master Plumber | Commercial Plumber",
      distance: "2 miles away from Fareham",
      rating: "5/5 (5 reviews)",
      jobSuccess: "100% Job Success",
      skills: [
        "Pipe Installation and Repair",
        "Blueprint Reading",
        "Pipe Fitting and Welding",
        "Fixture Installation",
        "Leak Detection and Repair"
      ],
      testimonial: "I was nervous about finding the right contractor for our home renovation, but this platform made it so easy. Within hours, I received quotes from several qualified tradesperson. The work was completed on time and exceeded our expectations. Highly recommend!",
      image: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcS7iYfz3YYn62lPTOCRYe2cE7nQtG1w5LVIPNJeUFZJQQBCj6lS",
    },

  ];

  useEffect(() => {
    const getDetails = async () => {
      const cookie = await getUserDetails();
      const local = understand;
      const locl = local;
      if (cookie?.registration) {
        setIsCompleteReg(true);
      }
    };
    getDetails();
  }, []);

  useEffect(() => {
    // Prevent closing the dialog by disabling scroll and interactions outside of it
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ''; // Required for the confirmation dialog in some browsers
    };

    const preventNavigation = (event) => {
      event.preventDefault();
      event.returnValue = ''; // Required for the confirmation dialog in some browsers
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', preventNavigation);

    // Cleanup the event listeners on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', preventNavigation);
    };
  }, []);

  const handleBackClick = () => {
    setShowFirstDialog(false);
    setShowSecondDialog(true);
  };

  const handleContinueClick = () => {
    setShowFirstDialog(true);
    setShowSecondDialog(false);
  };

  const handleNavigateAway = () => {
    // Navigate to previous page
    router.push('/login/hire-tradesperson');
  };

  return (
    <div className="mt-2 max-w-7xl mx-auto w-screen px-4 sm:px-6 lg:px-8 bg-muted">
      <div>
        {/* Backdrop for blur effect */}
        {(showFirstDialog || showSecondDialog) && (
          <div className="fixed inset-0 bg-overlay/5 md:bg-overlay/20 backdrop-blur-sm z-50"></div>
        )}

        {/* Dialog to prevent closing or navigating away */}
        <Dialog open={showFirstDialog || showSecondDialog} className="relative z-60">
          <DialogContent>
            <DialogHeader>
              <div className="flex flex-col items-center text-center">
                {showFirstDialog && (
                  <>
                    <Image src={tick} width={74} height={74} alt="tick-circle" />
                    <DialogTitle className="mt-4 text-2xl">Great! we are almost there.</DialogTitle>
                    <DialogDescription className="text-md mt-2 mb-4">
                      Please provide your details now so tradesperson can find you.
                    </DialogDescription>
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        className="bg-muted font-semibold text-foreground px-10 py-2 rounded-md text-sm"
                        onClick={handleBackClick}
                      >
                        Back
                      </button>
                      <Link href={'/login/registration'}
                        className="bg-accent font-semibold hover:bg-primary hover:text-ink-inverse text-accent-foreground px-6 py-2 rounded-md text-sm"
                      >
                        Continue
                      </Link>

                    </div>
                  </>
                )}
                {showSecondDialog && (
                  <>
                    <DialogTitle className="mt-4 text-2xl">Are you sure that you want to leave?</DialogTitle>
                    <DialogDescription className="text-md mt-4 mb-4">
                      We need to know your details so tradesperson can find you easily.
                    </DialogDescription>
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        className="bg-muted font-semibold  text-foreground px-10 py-2 rounded-md text-sm"
                        onClick={handleNavigateAway}
                      >
                        Leave
                      </button>
                      <button
                        type="button"
                        className="bg-accent font-semibold text-accent-foreground hover:bg-primary hover:text-ink-inverse px-6 py-2 rounded-md text-sm"
                        onClick={handleContinueClick}
                      >
                        Continue
                      </button>
                    </div>
                  </>
                )}
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-muted">
          <span className='text-2xl font-bold mb-8'>Recommended Tradesperson</span>
          <div className='mt-4'>
            <CardDummy profiles={profiles} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
