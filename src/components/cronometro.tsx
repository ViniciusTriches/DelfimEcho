"use client";

import { useEffect, useState } from "react";
import { formatarCronometro } from "@/lib/datas";
import { segundosDoTimer } from "@/lib/pratica";

export type EstadoTimer = { iniciado_em: string; pausado_em: string | null; segundos_pausados: number };

/** Hora atual que avança a cada segundo (para cronômetros). */
export function useAgora(ativo = true) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    if (!ativo) return;
    const id = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(id);
  }, [ativo]);
  return agora;
}

/** Texto do cronômetro (hh:mm:ss), descontando pausas. */
export function Cronometro({ timer, className }: { timer: EstadoTimer; className?: string }) {
  const agora = useAgora(!timer.pausado_em);
  return (
    <span className={className} suppressHydrationWarning>
      {formatarCronometro(segundosDoTimer(timer, agora))}
    </span>
  );
}
