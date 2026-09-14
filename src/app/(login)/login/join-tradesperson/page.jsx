import React from 'react';
import SignupForm from '../../../../components/(Tradesperson)/SignupForm';
import Image from 'next/image';
import fg from '../../../../app/assets/tradepersonsignup.webp';
import bg from '../../../../app/assets/tradepersonsignupbg.webp';
export const metadata = {
  title: "Join as a Tradesperson | Get Local Trade Work",
  description: "Sign up as a tradesperson to get access to job leads in your local area. Choose your trade, set your location, and start quoting for jobs today.",
  openGraph: {
    title: "Join as a Tradesperson | Get Local Trade Work ",
    description: "Sign up as a tradesperson to get access to job leads in your local area. Choose your trade, set your location, and start quoting for jobs today.",
    url: `${process.env.NEXT_BASE_URL}/login/join-tradesperson`, // replace with real link

    siteName: "",
    images: [
      {
        url: `${process.env.NEXT_BASE_URL}/images/tradepersonsignup.png`, // your `fg` image
        width: 1200,
        height: 630,
        alt: "Signup for tradesperson preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join as a Tradesperson | Get Local Trade Work ",
    description: "Sign up as a tradesperson to get access to job leads in your local area. Choose your trade, set your location, and start quoting for jobs today.",
    images: [`${process.env.NEXT_BASE_URL}/images/tradepersonsignup.png`],
  },
};



const Page = () => {
  return (
    <div className="relative flex items-center justify-center md:min-h-screen bg-neutral-100">
      <div className="absolute inset-0 z-0 hidden md:block">
        <Image
          className="w-full h-full object-cover"
          src={bg}
          alt="Background"
          width={1440}       // design width
          height={742}       // design height
          priority           // LCP image
        />
      </div>
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-around w-full">
        <div className="w-full max-w-lg p-3 md:p-0 rounded-lg">
          <SignupForm />
        </div>
        <div className="w-full max-w-lg flex justify-center items-center hidden xl:block">
          <Image
            src={fg}
            alt="Worker"
            className="rounded-lg"
            width={'100%'}
            height={'100%'}
          />
        </div>
      </div>
    </div>
  );
}

export default Page;
