import type { Metadata } from "next";
import Link from "next/link";
import { TimerIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { TimerPainel } from "./timer-painel";

export const metadata: Metadata = { title: "Timer" };

export default async function TimerPage() {
  const supabase = await createClient();
  const { data: timer } = await supabase
    .from("active_timer")
    .select("*, skills(nome, areas(nome, cor))")
    .maybeSingle();

  if (!timer) {
    return (
      <>
        <PageHeader titulo="Timer" />
        <div className="flex max-w-xl flex-col items-start gap-4 rounded-xl border p-5">
          <p className="text-muted-foreground">Nenhum timer ativo.</p>
          <Link href="/registrar" className={buttonVariants()}>
            <TimerIcon />
            Iniciar pela tela de registro
          </Link>
        </div>
      </>
    );
  }

  return (
    <TimerPainel
      timer={{
        iniciado_em: timer.iniciado_em,
        pausado_em: timer.pausado_em,
        segundos_pausados: timer.segundos_pausados,
      }}
      distracoes={timer.distracoes}
      habilidade={timer.skills?.nome ?? "Habilidade"}
      area={timer.skills?.areas?.nome ?? ""}
      cor={timer.skills?.areas?.cor ?? "#0ea5e9"}
      foco={timer.foco_especifico}
    />
  );
}
