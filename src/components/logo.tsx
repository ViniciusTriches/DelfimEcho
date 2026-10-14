import { cn } from "@/lib/utils";

/** Marca do Echo: o golfinho emite, as ondas voltam (ecolocalização). */
export function Marca({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-7 text-primary", className)}>
      <circle cx="5" cy="12" r="2.25" fill="currentColor" />
      <path
        d="M10 7.5a6.5 6.5 0 0 1 0 9M14 4.5a10.5 10.5 0 0 1 0 15M18 2a14 14 0 0 1 0 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className, somenteMarca = false }: { className?: string; somenteMarca?: boolean }) {
  if (somenteMarca) return <Marca className={className} />;
  return (
    <span className={cn("inline-flex items-center gap-2 type-title-large font-medium text-on-surface", className)}>
      <Marca className="size-6" />
      Echo
    </span>
  );
}
