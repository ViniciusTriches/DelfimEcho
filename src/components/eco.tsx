"use client";

import { animate, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { EASE } from "@/components/movimento";
import { cn } from "@/lib/utils";

// Assinatura "Eco": anéis que se expandem a partir de onde algo importante aconteceu,
// como o eco de uma ação. Nunca bloqueiam nada (pointer-events: none) e não aparecem
// para quem pede menos movimento: a confirmação em si (ícone, texto) continua lá.

const ONDAS = 3;
const ATRASO = 0.16;
const DURACAO = 1.1;

/** Anéis centrados no elemento pai (que precisa ser `relative`). */
export function EcoAneis({ cor = "var(--md-primary)", escala = 2.6, className }: { cor?: string; escala?: number; className?: string }) {
  const reduzido = useReducedMotion();
  if (reduzido) return null;
  return (
    <span className={cn("pointer-events-none absolute inset-0 flex items-center justify-center", className)} aria-hidden>
      {Array.from({ length: ONDAS }, (_, i) => (
        <m.span
          key={i}
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: cor }}
          initial={{ scale: 0.7, opacity: 0.6 }}
          animate={{ scale: escala, opacity: 0 }}
          transition={{ duration: DURACAO, delay: i * ATRASO, ease: EASE.desacelera }}
        />
      ))}
    </span>
  );
}

/**
 * Eco solto na tela, num retângulo (ex.: o botão que disparou a ação). Útil quando o
 * elemento de origem some logo depois (a meta concluída sai da lista).
 */
export function ecoNaTela(r: DOMRect, cor = "var(--md-primary)") {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const lado = Math.max(r.width, r.height);
  const raiz = document.createElement("div");
  raiz.setAttribute("aria-hidden", "true");
  Object.assign(raiz.style, {
    position: "fixed",
    left: `${r.left + r.width / 2 - lado / 2}px`,
    top: `${r.top + r.height / 2 - lado / 2}px`,
    width: `${lado}px`,
    height: `${lado}px`,
    pointerEvents: "none",
    zIndex: "60",
  });
  const animacoes = Array.from({ length: ONDAS }, (_, i) => {
    const anel = document.createElement("span");
    Object.assign(anel.style, {
      position: "absolute",
      inset: "0",
      borderRadius: "9999px",
      border: `2px solid ${cor}`,
      opacity: "0",
    });
    raiz.appendChild(anel);
    return animate(
      anel,
      { scale: [0.6, 2.4], opacity: [0.6, 0] },
      { duration: DURACAO, delay: i * ATRASO, ease: EASE.desacelera },
    );
  });
  document.body.appendChild(raiz);
  Promise.all(animacoes.map((a) => a.finished)).finally(() => raiz.remove());
}
