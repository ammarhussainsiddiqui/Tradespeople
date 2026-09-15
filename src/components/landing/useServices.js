'use client';

import { useEffect, useState } from 'react';

// Fired by trade chips and featured-tradesperson cards; the hero search listens
// and pre-selects that trade.
export const SELECT_SERVICE_EVENT = 'tp:select-service';

// One shared request for every landing-page component that needs the trade list.
let servicesPromise;

function loadServices() {
  if (!servicesPromise) {
    servicesPromise = fetch('/api/services')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => (Array.isArray(data?.services) ? data.services : []))
      .then((list) =>
        list
          .filter((service) => service && service.type)
          .sort((a, b) => a.type.localeCompare(b.type))
      )
      .catch((error) => {
        // Let a later mount retry instead of caching the failure.
        servicesPromise = undefined;
        throw error;
      });
  }
  return servicesPromise;
}

export function useServices() {
  const [state, setState] = useState({ services: [], status: 'loading' });

  useEffect(() => {
    let active = true;
    loadServices()
      .then((services) => active && setState({ services, status: 'ready' }))
      .catch(() => active && setState({ services: [], status: 'error' }));
    return () => {
      active = false;
    };
  }, []);

  return state;
}

// Pre-select a trade in the hero search and bring the search into view.
export function selectServiceAndScroll(serviceId) {
  if (serviceId !== undefined && serviceId !== null) {
    window.dispatchEvent(new CustomEvent(SELECT_SERVICE_EVENT, { detail: serviceId }));
  }
  const target = document.getElementById('get-quotes');
  if (target) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }
}
