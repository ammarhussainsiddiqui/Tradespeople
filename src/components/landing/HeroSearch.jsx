'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, ChevronDown, MapPin, Wrench } from 'lucide-react';
import { getUserDetails } from '../../actions/auth';
import { SELECT_SERVICE_EVENT, useServices } from './useServices';

// Mirrors the hire flow's UK postcode rule. Deliberately not imported from
// utils/functions: that module reads server secrets at import time and would
// ship them in this page's client bundle.
const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/;

function normalisePostcode(value) {
  const compact = value.replace(/\s+/g, '').toUpperCase();
  return compact.length > 3 ? `${compact.slice(0, -3)} ${compact.slice(-3)}` : compact;
}

function dashboardFor(user) {
  if (user?.roleId === 1) return '/user/myjobs';
  if (user?.roleId === 2) {
    return user.SubscriptionType === 'Deactivate' ? '/tradesperson/subscription' : '/tradesperson/home';
  }
  return null;
}

const PROMISES = ['Free to post', 'No obligation to hire', 'Screened, reviewed tradespeople'];

export default function HeroSearch() {
  const router = useRouter();
  const { services, status } = useServices();
  const [serviceId, setServiceId] = useState('');
  const [postcode, setPostcode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const postcodeRef = useRef(null);
  const id = useId();

  useEffect(() => {
    getUserDetails()
      .then((user) => setDashboard(dashboardFor(user)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onSelect = (event) => {
      setServiceId(String(event.detail));
      setError('');
      postcodeRef.current?.focus({ preventScroll: true });
    };
    window.addEventListener(SELECT_SERVICE_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_SERVICE_EVENT, onSelect);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    // If the trade list could not load, the hire flow's own first step still works.
    if (status === 'error') {
      router.push('/login/hire-tradesperson');
      return;
    }
    if (!serviceId) {
      setError('Choose the type of job you need done.');
      return;
    }
    const code = normalisePostcode(postcode);
    if (!UK_POSTCODE.test(code)) {
      setError('Enter a full UK postcode, like SE15 4TR.');
      postcodeRef.current?.focus();
      return;
    }

    setError('');
    setSubmitting(true);
    router.push(
      `/login/hire-tradesperson?serviceId=${encodeURIComponent(serviceId)}&code=${encodeURIComponent(code)}`
    );
  };

  const selectPlaceholder =
    status === 'loading'
      ? 'Loading trades…'
      : status === 'error'
        ? 'Choose your trade on the next step'
        : 'What do you need done?';

  return (
    <div className="flex flex-col gap-5">
      {dashboard && (
        <p className="text-sm text-muted-foreground">
          You&apos;re signed in.{' '}
          <Link href={dashboard} className="font-semibold text-accent underline-offset-4 hover:underline">
            Go to your dashboard
          </Link>
        </p>
      )}

      <form
        id="get-quotes"
        onSubmit={handleSubmit}
        noValidate
        className="scroll-mt-28 rounded-xl border border-border bg-card p-2 shadow-soft-md"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <label htmlFor={`${id}-service`} className="sr-only">
              Type of job
            </label>
            <Wrench
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <select
              id={`${id}-service`}
              value={serviceId}
              onChange={(event) => {
                setServiceId(event.target.value);
                setError('');
              }}
              disabled={status === 'loading'}
              className="h-12 w-full appearance-none rounded-lg border border-transparent bg-muted pl-9 pr-9 text-sm text-foreground transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait"
            >
              <option value="">{selectPlaceholder}</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.type}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>

          <div className="relative sm:w-44">
            <label htmlFor={`${id}-postcode`} className="sr-only">
              Postcode
            </label>
            <MapPin
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id={`${id}-postcode`}
              ref={postcodeRef}
              value={postcode}
              onChange={(event) => {
                setPostcode(event.target.value.toUpperCase());
                setError('');
              }}
              onBlur={() => postcode && setPostcode(normalisePostcode(postcode))}
              placeholder="Postcode"
              autoComplete="postal-code"
              maxLength={8}
              spellCheck={false}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${id}-error` : undefined}
              className="h-12 w-full rounded-lg border border-transparent bg-muted pl-9 pr-3 font-mono text-sm uppercase tracking-wide text-foreground placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-70"
          >
            {submitting ? 'Opening…' : 'Get free quotes'}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <p id={`${id}-error`} role="alert" className="px-2 pb-1 pt-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </form>

      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
        {PROMISES.map((promise) => (
          <li key={promise} className="inline-flex items-center gap-1.5">
            <Check aria-hidden="true" className="h-4 w-4 text-success" />
            {promise}
          </li>
        ))}
      </ul>
    </div>
  );
}
