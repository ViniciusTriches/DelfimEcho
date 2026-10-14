"use client";

import { useEffect, useRef } from "react";
import { TrophyIcon } from "lucide-react";

/**
 * Comemoração de novo nível: o momento mais raro do app ganha uma coreografia própria
 * (cartão abre do centro, anéis de eco em ondas, nome do nível sobe). É o único lugar
 * com GSAP, importado sob demanda só quando um nível é alcançado.
 * O cartão é visível por padrão: se o GSAP não carregar, ele só aparece sem animação.
 */
export function ComemoracaoNivel({ nivel, habilidade }: { nivel: string; habilidade: string }) {
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let desfazer: (() => void) | undefined;
    let cancelado = false;

    import("gsap").then(({ gsap }) => {
      const el = raiz.current;
      if (cancelado || !el) return;
      const mm = gsap.matchMedia();
      mm.add(
        { normal: "(prefers-reduced-motion: no-preference)", reduzido: "(prefers-reduced-motion: reduce)" },
        (contexto) => {
          const q = gsap.utils.selector(el);
          if (contexto.conditions?.reduzido) {
            gsap.from(el, { opacity: 0, duration: 0.3, ease: "power1.out" });
            return;
          }
          gsap
            .timeline({ defaults: { ease: "expo.out" } })
            .from(el, { clipPath: "inset(0% 50% 0% 50% round 16px)", duration: 0.7 })
            .fromTo(
              q("[data-anel]"),
              { scale: 0.5, opacity: 0.7 },
              { scale: 3.2, opacity: 0, duration: 1.6, stagger: 0.2, ease: "power2.out" },
              0.15,
            )
            .from(q("[data-trofeu]"), { scale: 0.4, rotate: -20, duration: 0.8, ease: "back.out(2)" }, 0.2)
            .from(q("[data-nivel]"), { yPercent: 80, opacity: 0, duration: 0.6 }, 0.3)
            .from(q("[data-detalhe]"), { opacity: 0, duration: 0.4, ease: "power1.out" }, 0.55);
        },
        el,
      );
      desfazer = () => mm.revert();
    });

    return () => {
      cancelado = true;
      desfazer?.();
    };
  }, []);

  return (
    <div
      ref={raiz}
      role="status"
      className="relative flex w-full items-center gap-4 overflow-hidden rounded-lg bg-tertiary-container px-5 py-4 text-on-tertiary-container"
    >
      <span className="relative flex size-12 shrink-0 items-center justify-center">
        {[0, 1, 2].map((i) => (
          <span key={i} data-anel className="absolute inset-0 rounded-full border-2 border-current opacity-0" aria-hidden />
        ))}
        <span data-trofeu className="relative flex size-12 items-center justify-center rounded-full bg-on-tertiary-container text-tertiary-container">
          <TrophyIcon className="size-6" aria-hidden />
        </span>
      </span>
      <div className="min-w-0 overflow-hidden">
        <p data-nivel className="type-headline-small">{nivel}</p>
        <p data-detalhe className="type-body-medium">Novo nível em {habilidade}</p>
      </div>
    </div>
  );
}
