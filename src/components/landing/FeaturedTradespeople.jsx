'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { selectServiceAndScroll, useServices } from './useServices';

const MAX_CARDS = 6;

function initials(person) {
  return `${person.firstName?.[0] ?? ''}${person.lastName?.[0] ?? ''}`.toUpperCase() || '?';
}

function Avatar({ person }) {
  const [failed, setFailed] = useState(false);
  if (!person.profileUrl || failed) {
    return (
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-info text-base font-semibold text-foreground">
        {initials(person)}
      </span>
    );
  }
  return (
    // Plain <img>: profile photos come from several hosts, and a host missing
    // from next.config would make next/image throw at runtime.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={person.profileUrl}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-14 w-14 shrink-0 rounded-full border border-border object-cover"
    />
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className="h-14 w-14 rounded-full bg-muted motion-safe:animate-pulse" />
        <div className="flex flex-1 flex-col gap-2">
          <span className="h-4 w-2/3 rounded bg-muted motion-safe:animate-pulse" />
          <span className="h-3 w-1/3 rounded bg-muted motion-safe:animate-pulse" />
        </div>
      </div>
      <span className="h-3 w-full rounded bg-muted motion-safe:animate-pulse" />
      <span className="h-3 w-5/6 rounded bg-muted motion-safe:animate-pulse" />
    </div>
  );
}

export default function FeaturedTradespeople() {
  const [state, setState] = useState({ people: [], status: 'loading' });
  const { services } = useServices();

  useEffect(() => {
    let active = true;
    fetch('/api/top-tradepersons')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        const people = (Array.isArray(data?.data) ? data.data : []).slice(0, MAX_CARDS);
        if (active) setState({ people, status: 'ready' });
      })
      .catch(() => active && setState({ people: [], status: 'error' }));
    return () => {
      active = false;
    };
  }, []);

  // Nothing to show: leave the section out rather than render an empty shell.
  if (state.status === 'error' || (state.status === 'ready' && state.people.length === 0)) {
    return null;
  }

  const requestQuote = (person) => {
    const match = services.find((service) =>
      (person.services || []).some((name) => name?.toLowerCase() === service.type.toLowerCase())
    );
    selectServiceAndScroll(match?.id);
  };

  return (
    <section aria-labelledby="featured-heading" className="border-b border-border bg-muted">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Featured</p>
          <h2 id="featured-heading" className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tradespeople you can hire today
          </h2>
          <p className="text-base text-muted-foreground">
            A selection of the tradespeople on TradePeople. Post your job to hear from them and others who cover your area.
          </p>
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {state.status === 'loading'
            ? Array.from({ length: 3 }, (_, index) => (
                <li key={index}>
                  <SkeletonCard />
                </li>
              ))
            : state.people.map((person) => {
                const name = [person.firstName, person.lastName].filter(Boolean).join(' ') || person.name;
                const trades = person.services || [];
                return (
                  <li key={person.id}>
                    <article className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-soft">
                      <div className="flex items-center gap-3">
                        <Avatar person={person} />
                        <div className="flex min-w-0 flex-col">
                          <h3 className="truncate text-base font-semibold text-card-foreground">{name}</h3>
                          {person.reviews > 0 ? (
                            <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                              <Star aria-hidden="true" className="h-4 w-4 fill-current text-warning" />
                              <span className="font-semibold tabular-nums text-card-foreground">
                                {person.reviews.toFixed(1)}
                              </span>
                              {person.totalReviews > 0 && (
                                <span className="tabular-nums">
                                  ({person.totalReviews} Google {person.totalReviews === 1 ? 'review' : 'reviews'})
                                </span>
                              )}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">{trades[0] || 'Tradesperson'}</p>
                          )}
                        </div>
                      </div>

                      {trades.length > 0 && (
                        <ul className="flex flex-wrap gap-1.5" aria-label="Trades">
                          {trades.slice(0, 3).map((trade) => (
                            <li
                              key={trade}
                              className="rounded-md bg-surface-info px-2 py-0.5 text-xs font-medium text-card-foreground"
                            >
                              {trade}
                            </li>
                          ))}
                          {trades.length > 3 && (
                            <li className="rounded-md px-2 py-0.5 text-xs text-muted-foreground">+{trades.length - 3} more</li>
                          )}
                        </ul>
                      )}

                      {person.introduction && (
                        <p className="line-clamp-3 text-sm text-muted-foreground">{person.introduction}</p>
                      )}

                      <button
                        type="button"
                        onClick={() => requestQuote(person)}
                        className="mt-auto inline-flex h-10 items-center justify-center rounded-lg border border-border text-sm font-semibold text-card-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Request a quote
                      </button>
                    </article>
                  </li>
                );
              })}
        </ul>
      </div>
    </section>
  );
}
