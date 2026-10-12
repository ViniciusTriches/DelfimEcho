import Link from "next/link";
import { Cronometro } from "@/components/cronometro";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

/** Atalho para o timer ativo, no cabeçalho. Não renderiza nada sem timer. */
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
      className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
      title="Abrir o timer"
    >
      <span
        className={cn("size-2 rounded-full bg-primary", !timer.pausado_em && "animate-pulse")}
        aria-hidden
      />
      <Cronometro timer={timer} className="font-mono tabular-nums" />
      <span className="hidden max-w-32 truncate sm:inline">{timer.skills?.nome}</span>
    </Link>
  );
}
