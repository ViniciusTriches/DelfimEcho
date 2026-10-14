"use client";

import { useEffect } from "react";

/**
 * Ripple "Eco" do Material 3, para o app inteiro com um só listener: ao tocar num
 * elemento com a classe `camada-estado`, uma onda se expande do ponto tocado e some.
 * Não bloqueia nada (o clique segue normalmente) e não roda com prefers-reduced-motion.
 */
export function EcoRipple() {
  useEffect(() => {
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)");

    function aoTocar(e: PointerEvent) {
      if (reduzido.matches || e.button !== 0) return;
      const alvo = (e.target as Element | null)?.closest<HTMLElement>(".camada-estado");
      if (!alvo || alvo.matches(":disabled, [aria-disabled='true'], [data-sem-ripple]")) return;

      const r = alvo.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      // Raio até o canto mais distante: a onda cobre o elemento inteiro.
      const raio = Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y));

      const onda = document.createElement("span");
      onda.className = "eco-ripple";
      onda.setAttribute("aria-hidden", "true");
      Object.assign(onda.style, {
        width: `${raio * 2}px`,
        height: `${raio * 2}px`,
        left: `${x - raio}px`,
        top: `${y - raio}px`,
      });
      alvo.appendChild(onda);
      onda.addEventListener("animationend", () => onda.remove(), { once: true });
    }

    document.addEventListener("pointerdown", aoTocar, { passive: true });
    return () => document.removeEventListener("pointerdown", aoTocar);
  }, []);

  return null;
}
