import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroSearch from '../components/landing/HeroSearch';
import HeroPreview from '../components/landing/HeroPreview';
import FeaturedTradespeople from '../components/landing/FeaturedTradespeople';
import BrowseByTrade from '../components/landing/PopularTrades';
import { AreasCovered, HowItWorks, TradespersonBand } from '../components/landing/LandingSections';
import { updatedAreaSegments } from '../actions/auth';

const TITLE = 'Find & Hire Trusted Local Tradespeople | TradePeople';
const DESCRIPTION =
  'Post your job for free and hear from screened, reviewed tradespeople who cover your postcode. No obligation to hire.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${process.env.NEXT_BASE_URL}/`,
    images: [
      {
        url: `${process.env.NEXT_BASE_URL}/images/tradepeople-logo.png`,
        width: 1920,
        height: 1920,
        alt: 'TradePeople logo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [`${process.env.NEXT_BASE_URL}/images/tradepeople-logo.png`],
  },
  alternates: {
    canonical: `${process.env.NEXT_BASE_URL}/`,
  },
};

export default async function Home() {
  // Static region list (no database), so this page still prerenders at build time.
  const segments = await updatedAreaSegments();
  const areas = [...new Set(segments.map((segment) => segment.label.replace(/\s+and Surroundings$/i, '').trim()))].sort(
    (a, b) => a.localeCompare(b)
  );

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        <section aria-labelledby="hero-heading" className="relative overflow-hidden border-b border-border">
          {/* Faint dot grid, drawn from the border token so it follows the theme */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
          />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:px-8 lg:pb-24">
            <div className="flex flex-col gap-6">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                UK trade directory · {areas.length} areas covered
              </p>
              <h1
                id="hero-heading"
                className="max-w-[16ch] text-balance text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              >
                Find a trusted tradesperson near you
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Post your job for free. Local tradespeople who cover your postcode get in touch, and you choose who to hire.
              </p>
              <HeroSearch />
            </div>
            <HeroPreview />
          </div>
        </section>

        <HowItWorks />
        <FeaturedTradespeople />
        <BrowseByTrade />
        <AreasCovered areas={areas} />
        <TradespersonBand />
      </main>

      <Footer />
    </div>
  );
}
