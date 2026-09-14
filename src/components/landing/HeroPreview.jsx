import { Check, Wrench } from 'lucide-react';

// Decorative illustration of what a homeowner sees after posting a job.
// It is a UI sketch, not data: no names, ratings or counts.
const STEPS = [
  { title: 'Job posted', detail: 'Free, with no obligation to hire', state: 'done' },
  { title: 'Tradespeople respond', detail: 'Local tradespeople who cover SE15 get in touch', state: 'active' },
  { title: 'You choose who to hire', detail: 'Compare profiles and request quotes', state: 'todo' },
  { title: 'Leave a review', detail: 'Help the next homeowner choose', state: 'todo' },
];

function StepMarker({ state }) {
  if (state === 'done') {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    );
  }
  if (state === 'active') {
    return (
      <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
        <span className="absolute h-6 w-6 rounded-full bg-accent/25 motion-safe:animate-ping" />
        <span className="relative h-3 w-3 rounded-full bg-accent" />
      </span>
    );
  }
  return <span className="h-6 w-6 shrink-0 rounded-full border-2 border-border bg-card" />;
}

export default function HeroPreview() {
  return (
    <div aria-hidden="true" className="relative hidden select-none lg:block">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft-lg">
        {/* Editor-style tab strip, active tab marked like VS Code's tab.activeBorderTop */}
        <div className="flex border-b border-border bg-muted text-xs">
          <span className="border-t-2 border-t-accent bg-card px-4 py-2.5 font-medium text-foreground">
            Your job
          </span>
          <span className="border-t-2 border-t-transparent px-4 py-2.5 text-muted-foreground">Messages</span>
          <span className="border-t-2 border-t-transparent px-4 py-2.5 text-muted-foreground">Quotes</span>
        </div>

        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs text-muted-foreground">SE15 · Plumbing</p>
              <p className="mt-1 text-lg font-semibold text-foreground">Leaking kitchen tap</p>
            </div>
            <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success-soft-foreground">
              Live
            </span>
          </div>

          <ol className="flex flex-col gap-4">
            {STEPS.map((step) => (
              <li key={step.title} className="flex gap-3">
                <StepMarker state={step.state} />
                <div className="flex flex-col">
                  <span
                    className={
                      step.state === 'todo' ? 'text-sm font-medium text-muted-foreground' : 'text-sm font-semibold text-foreground'
                    }
                  >
                    {step.title}
                  </span>
                  <span className="text-xs text-muted-foreground">{step.detail}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between bg-accent px-4 py-1.5 font-mono text-[11px] text-accent-foreground">
          <span>● Job live</span>
          <span>Free to post</span>
        </div>
      </div>

      <div className="absolute -bottom-7 -left-8 flex w-72 items-center gap-3 rounded-lg border border-border bg-popover p-4 shadow-soft-md">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-info text-foreground">
          <Wrench className="h-5 w-5" />
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-popover-foreground">A local plumber is interested</span>
          <span className="text-xs text-muted-foreground">Covers SE15</span>
        </div>
      </div>
    </div>
  );
}
