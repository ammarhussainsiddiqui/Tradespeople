'use client';

import { useState } from 'react';
import { selectServiceAndScroll, useServices } from './useServices';

const COLLAPSED_COUNT = 18;

export default function BrowseByTrade() {
  const { services, status } = useServices();
  const [expanded, setExpanded] = useState(false);

  if (status === 'error' || (status === 'ready' && services.length === 0)) {
    return null;
  }

  const visible = expanded ? services : services.slice(0, COLLAPSED_COUNT);
  const hiddenCount = services.length - COLLAPSED_COUNT;

  return (
    <section aria-labelledby="trades-heading" className="border-b border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Trades</p>
          <h2 id="trades-heading" className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Browse by trade
          </h2>
          <p className="text-base text-muted-foreground">Pick a trade to start your free job post.</p>
        </div>

        {status === 'loading' ? (
          <div className="flex flex-wrap gap-2" aria-hidden="true">
            {Array.from({ length: 12 }, (_, index) => (
              <span key={index} className="h-10 w-32 rounded-lg bg-muted motion-safe:animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <ul className="flex flex-wrap gap-2">
              {visible.map((service) => (
                <li key={service.id}>
                  <button
                    type="button"
                    onClick={() => selectServiceAndScroll(service.id)}
                    className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:border-ring hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {service.type}
                  </button>
                </li>
              ))}
            </ul>
            {hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
                className="self-start text-sm font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {expanded ? 'Show fewer trades' : `Show all ${services.length} trades`}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
