"use client";

import * as m from "motion/react-m";
import { EASE } from "@/components/movimento";

/** Check que se desenha (mesmo traço do CheckIcon do lucide). Só traço: segue o reduced-motion por ser curto. */
export function CheckAnimado({
  className,
  strokeWidth = 3,
  atraso = 0,
  animar = true,
}: {
  className?: string;
  strokeWidth?: number;
  atraso?: number;
  /** false: já aparece desenhado (ex.: itens que vieram marcados do servidor). */
  animar?: boolean;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <m.path
        d="M20 6 9 17l-5-5"
        initial={animar ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.25, delay: atraso, ease: EASE.desacelera }}
      />
    </svg>
  );
}
