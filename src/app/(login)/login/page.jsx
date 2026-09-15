export const metadata = {
  title: 'Login – Post Jobs or Find Local Tradespeople',
  description:
    'Login to post jobs or find local, trusted tradespeople. Whether you\'re looking to hire or offer your services, get started today.',
  openGraph: {
    title: 'Login – Post Jobs or Find Local Tradespeople',
    description:
      'Login to post jobs or find local, trusted tradespeople. Whether you\'re looking to hire or offer your services, get started today.',
    url: `${process.env.NEXT_BASE_URL}/login`,
    images: [
      {
        url: `${process.env.NEXT_BASE_URL}/images/tradepeople-logo.png`,
        width: 1920,
        height: 1920,
        alt: "TradePeople logo",
      },
    ],
    siteName: "",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Login – Post Jobs or Find Local Tradespeople',
    description:
      'Login to post jobs or find local, trusted tradespeople. Whether you\'re looking to hire or offer your services, get started today.',
    images: [`${process.env.NEXT_BASE_URL}/images/tradepeople-logo.png`],
  },
  alternates: {
    canonical: `${process.env.NEXT_BASE_URL}/login`,
  },
};

// Import your actual login component (client or server)
import Page from './LoginPage'; // This should be your client component (with `"use client"` if needed)

export default function page() {
  return (
    <div>
      <Page />
    </div>
  );
}