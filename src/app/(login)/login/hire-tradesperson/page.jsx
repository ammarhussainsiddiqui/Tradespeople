export const metadata = {
  title: 'Post a Job for Free | Hire Verified Tradespeople Near You',
  description:
    'Find local professionals for your job. Post your requirements and get quick responses from verified, reviewed tradespeople.',
  openGraph: {
    title: 'Post a Job for Free | Hire Verified Tradespeople Near You',
    description:
      'Find local professionals for your job. Post your requirements and get quick responses from verified, reviewed tradespeople.',
    url: `${process.env.NEXT_BASE_URL}/login/hire-tradesperson`,
    siteName: "",
    images: [
      {

        url: `${process.env.NEXT_BASE_URL}/images/step1.png`,

        width: 800,
        height: 600,
        alt: 'Plumber image',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Post a Job for Free | Hire Verified Tradespeople Near You',
    description:
      'Find local professionals for your job. Post your requirements and get quick responses from verified, reviewed tradespeople.',

    images: [`${process.env.NEXT_BASE_URL}/images/step1.png`],

  },
  alternates: {
    canonical: `${process.env.NEXT_BASE_URL}/login/hire-tradesperson`,
  },
};

// Import your page component (client or server)
import Page from './HireTradesperson';

export default function HireTradespersonPage() {
  return (
    <div>
      <Page />
    </div>
  );
}
