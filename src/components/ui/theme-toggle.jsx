"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../../app/providers/ThemeProvider";
import { cn } from "../../lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "system", label: "System", Icon: Monitor },
  { value: "dark", label: "Dark", Icon: Moon },
];

/**
 * Three-way theme switch (light / system / dark).
 * Renders a neutral placeholder until mounted so server and client markup match.
 */
export default function ThemeToggle({ className }) {
  const { theme, setTheme, mounted } = useTheme();

  if (!mounted) {
    return <div className={cn("h-9 w-[108px] rounded-full bg-neutral-100", className)} aria-hidden />;
  }

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border bg-neutral-100 p-0.5",
        className
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-surface text-foreground shadow-soft"
                : "text-ink-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
