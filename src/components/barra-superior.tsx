"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Top app bar do Material 3: na superfície do fundo; ao rolar o conteúdo por baixo,
 * muda de tom (surface-container) em vez de ganhar sombra.
 */
export function BarraSuperior({ children }: { children: React.ReactNode }) {
  const sentinela = useRef<HTMLDivElement>(null);
  const [rolada, setRolada] = useState(false);

  useEffect(() => {
    const el = sentinela.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setRolada(!e.isIntersecting));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinela} aria-hidden className="h-px" />
      <header
        className={cn(
          "sticky top-0 z-10 pt-[env(safe-area-inset-top)] transition-colors duration-300 ease-standard",
          rolada ? "bg-surface-container" : "bg-surface",
        )}
      >
        {children}
      </header>
    </>
  );
}
