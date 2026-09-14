import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const STEPS = [
  {
    title: 'Tell us about the job',
    body: 'Pick the trade, answer a few quick questions and add your postcode. Posting is free.',
  },
  {
    title: 'Hear from local tradespeople',
    body: 'Tradespeople who cover your area see your job and let you know they are interested.',
  },
  {
    title: 'Choose, hire and review',
    body: 'Compare profiles and Google reviews, request quotes, hire who you like — then leave a review.',
  },
];

function Eyebrow({ children }) {
  return <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">{children}</p>;
}

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="border-b border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_2fr] lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-3">
          <Eyebrow>How it works</Eyebrow>
          <h2 id="how-heading" className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            From problem to fixed in three steps
          </h2>
          <p className="text-base text-muted-foreground">
            You stay in control the whole way. Nobody is booked until you decide who to hire.
          </p>
        </div>

        <ol className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-3 bg-card p-6">
              <span className="font-mono text-sm font-semibold text-accent">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-lg font-semibold text-card-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function AreasCovered({ areas }) {
  if (!areas?.length) return null;
  return (
    <section aria-labelledby="areas-heading" className="border-b border-border bg-muted">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_2fr] lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-3">
          <Eyebrow>Coverage</Eyebrow>
          <h2 id="areas-heading" className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Where we work
          </h2>
          <p className="text-base text-muted-foreground">
            Tradespeople on The Trade Core cover {areas.length} areas across England, Scotland, Wales and Northern Ireland,
            plus the towns around each one.
          </p>
        </div>

        <ul className="columns-2 gap-8 text-sm sm:columns-3 xl:columns-4">
          {areas.map((area) => (
            <li key={area} className="break-inside-avoid py-1.5 text-foreground">
              {area}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function TradespersonBand() {
  return (
    <section aria-labelledby="trades-cta-heading" className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-primary-foreground/80">For tradespeople</p>
          <h2 id="trades-cta-heading" className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Win work in the areas you cover
          </h2>
          <p className="text-base text-primary-foreground/90">
            Build a profile homeowners can find, choose the postcodes you work in, and see jobs posted near you.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {/* Button text reads the fill token, not text-primary (which is the link colour). */}
          <Link
            href="/login/join-tradesperson"
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary-foreground px-6 text-sm font-semibold text-[hsl(var(--primary))] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            Join as a tradesperson
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-primary-foreground underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
          >
            Already a member? Log in
          </Link>
        </div>
      </div>
    </section>
  );
}
