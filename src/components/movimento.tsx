"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";

/** Curvas do Material 3 (as mesmas de globals.css), para o Motion. */
export const EASE = {
  padrao: [0.2, 0, 0, 1],
  desacelera: [0.05, 0.7, 0.1, 1],
  acelera: [0.3, 0, 0.8, 0.15],
} as const;

/**
 * Motion no app inteiro: só o pacote de animações de DOM (LazyMotion + `m`) e
 * `reducedMotion="user"`, que tira movimento espacial de quem pede menos movimento,
 * mantendo opacidade e cor.
 */
export function Movimento({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.2, ease: EASE.padrao }}>
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
