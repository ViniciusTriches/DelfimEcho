"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const MEIA_HORA = 30 * 60_000;

/**
 * Registra o service worker (só em produção) e avisa quando um deploy novo chega:
 * snackbar "Nova versão disponível" com "Atualizar". Nada é trocado sem o toque.
 */
export function AtualizacaoApp() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    let atualizando = false;
    let avisado = false;
    let intervalo: ReturnType<typeof setInterval> | undefined;

    const avisar = (novo: ServiceWorker) => {
      if (avisado) return;
      avisado = true;
      toast("Nova versão disponível", {
        duration: Infinity,
        action: {
          label: "Atualizar",
          onClick: () => {
            atualizando = true;
            novo.postMessage({ tipo: "pular-espera" });
          },
        },
      });
    };

    // O service worker novo assumiu (depois do "Atualizar"): recarrega com a versão nova.
    const aoTrocar = () => {
      if (atualizando) window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", aoTrocar);

    let registro: ServiceWorkerRegistration | undefined;
    const verificar = () => {
      if (document.visibilityState === "visible") registro?.update().catch(() => {});
    };

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((reg) => {
        registro = reg;
        // Já havia uma versão esperando (a aba ficou aberta durante o deploy).
        if (reg.waiting && navigator.serviceWorker.controller) avisar(reg.waiting);
        reg.addEventListener("updatefound", () => {
          const novo = reg.installing;
          novo?.addEventListener("statechange", () => {
            // Primeira instalação (sem controlador) não é atualização: nada a avisar.
            if (novo.state === "installed" && navigator.serviceWorker.controller) avisar(novo);
          });
        });
        intervalo = setInterval(verificar, MEIA_HORA);
        document.addEventListener("visibilitychange", verificar);
      })
      .catch(() => {});

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", aoTrocar);
      document.removeEventListener("visibilitychange", verificar);
      clearInterval(intervalo);
    };
  }, []);

  return null;
}
