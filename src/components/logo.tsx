import { cn } from "@/lib/utils";

/** Marca do Echo: ondas de ecolocalização. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <svg viewBox="0 0 24 24" aria-hidden className="size-5 text-primary">
        <circle cx="5" cy="12" r="2" fill="currentColor" />
        <path
          d="M10 7.5a6.5 6.5 0 0 1 0 9M14 4.5a10.5 10.5 0 0 1 0 15M18 2a14 14 0 0 1 0 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      Echo
    </span>
  );
}
