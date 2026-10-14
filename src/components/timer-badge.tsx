import Link from "next/link";
import { Cronometro } from "@/components/cronometro";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

/** Atalho para o timer ativo, na barra superior (chip). Não renderiza nada sem timer. */
export async function TimerBadge() {
  const supabase = await createClient();
  const { data: timer } = await supabase
    .from("active_timer")
    .select("iniciado_em, pausado_em, segundos_pausados, skills(nome)")
    .maybeSingle();
  if (!timer) return null;

  return (
    <Link
      href="/timer"
      className="camada-estado inline-flex h-8 items-center gap-2 rounded-sm bg-primary-container px-3 type-label-large text-on-primary-container pointer-coarse:min-h-11"
      title={timer.pausado_em ? "Timer pausado: abrir" : "Timer rodando: abrir"}
    >
      <span
        className={cn(
          "size-2 rounded-full bg-on-primary-container",
          timer.pausado_em ? "opacity-40" : "animate-pulse motion-reduce:animate-none",
        )}
        aria-hidden
      />
      <Cronometro timer={timer} className="numero" />
      <span className="hidden max-w-36 truncate sm:inline">{timer.skills?.nome}</span>
    </Link>
  );
}
