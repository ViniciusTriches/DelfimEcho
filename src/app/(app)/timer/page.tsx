import type { Metadata } from "next";
import Link from "next/link";
import { TimerIcon } from "lucide-react";
import { BotaoIniciarTimer } from "@/components/botao-iniciar-timer";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { formatarMinuto, localSP } from "@/lib/calendario";
import { corArea, corAreaSuave } from "@/lib/cores-area";
import { hojeSP } from "@/lib/datas";
import { createClient } from "@/lib/supabase/server";
import { carregarBlocos } from "../calendario/dados";
import { TimerPainel } from "./timer-painel";

export const metadata: Metadata = { title: "Timer" };

export default async function TimerPage() {
  const supabase = await createClient();
  // Em paralelo: o timer e, para o caso de não haver timer, as opções de começar.
  const [{ data: timer }, { proximoBloco, sugestoes }] = await Promise.all([
    supabase.from("active_timer").select("*, skills(nome, areas(nome, cor))").maybeSingle(),
    opcoesParaComecar(),
  ]);

  if (!timer) {
    return (
      <>
        <PageHeader titulo="Timer" />
        {(proximoBloco || sugestoes.length > 0) && (
          <section aria-labelledby="titulo-comecar" className="mb-6 flex max-w-xl flex-col gap-4">
            <h2 id="titulo-comecar" className="type-title-large text-on-surface">
              Começar agora
            </h2>
            {proximoBloco && (
              <div
                className="flex items-center gap-3 rounded-lg border-[1.5px] border-dashed py-3 pr-3 pl-4"
                style={{ borderColor: corArea(proximoBloco.cor), backgroundColor: corAreaSuave(proximoBloco.cor) }}
              >
                <span className="min-w-0 flex-1">
                  <span className="block type-label-medium text-on-surface">Planejado para hoje</span>
                  <span className="block truncate type-title-medium text-on-surface">{proximoBloco.habilidade}</span>
                  <span className="numero block type-label-medium text-on-surface">{proximoBloco.horario}</span>
                </span>
                <BotaoIniciarTimer skillId={proximoBloco.skillId} foco={proximoBloco.foco}>
                  Iniciar
                </BotaoIniciarTimer>
              </div>
            )}
            {sugestoes.length > 0 && (
              <ul className="flex flex-col divide-y divide-outline-variant overflow-hidden rounded-lg bg-surface-container-low">
                {sugestoes.map((h) => (
                  <li key={h.id} className="flex min-h-16 items-center gap-3 py-2 pr-2 pl-4">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: corArea(h.cor) }} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate type-body-large text-on-surface">{h.nome}</span>
                      {h.foco && <span className="block truncate type-body-small text-on-surface-variant">{h.foco}</span>}
                    </span>
                    <BotaoIniciarTimer skillId={h.id} foco={h.foco} variant="secondary" size="sm">
                      Iniciar
                    </BotaoIniciarTimer>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        <div className="flex max-w-xl flex-col items-start gap-4 rounded-lg bg-surface-container-low p-6">
          <span className="flex size-12 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
            <TimerIcon className="size-6" aria-hidden />
          </span>
          <div>
            <p className="type-title-medium text-on-surface">Nenhum timer ativo</p>
            <p className="mt-1 type-body-medium text-on-surface-variant">
              Para escolher outra habilidade e o foco, use a tela de registro e toque em Iniciar timer.
            </p>
          </div>
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

/** Sem timer: o próximo bloco de hoje no calendário e as habilidades mais usadas (90 dias). */
async function opcoesParaComecar() {
  const supabase = await createClient();
  const hoje = hojeSP();
  const desde = new Date(Date.now() - 90 * 86_400_000).toISOString();
  const [blocos, { data: skills }, { data: recentes }] = await Promise.all([
    carregarBlocos(hoje, hoje),
    supabase
      .from("skills")
      .select("id, nome, areas!inner(cor, arquivada)")
      .eq("arquivada", false)
      .eq("areas.arquivada", false),
    supabase
      .from("practice_sessions")
      .select("skill_id, proximo_passo, inicio")
      .gte("inicio", desde)
      .order("inicio", { ascending: false })
      .limit(300),
  ]);

  const ativas = new Map((skills ?? []).map((s) => [s.id, s]));
  const usos = new Map<string, number>();
  const proximoPasso = new Map<string, string>();
  for (const r of recentes ?? []) {
    if (!ativas.has(r.skill_id)) continue;
    usos.set(r.skill_id, (usos.get(r.skill_id) ?? 0) + 1);
    if (!proximoPasso.has(r.skill_id)) proximoPasso.set(r.skill_id, r.proximo_passo ?? "");
  }

  const agora = Date.now();
  const bloco = blocos.find((b) => new Date(b.fim).getTime() > agora && ativas.has(b.skillId));
  const proximoBloco = bloco
    ? {
        skillId: bloco.skillId,
        habilidade: ativas.get(bloco.skillId)!.nome,
        cor: ativas.get(bloco.skillId)!.areas.cor,
        foco: bloco.observacao ?? proximoPasso.get(bloco.skillId) ?? "",
        horario: `${formatarMinuto(localSP(bloco.inicio).minuto)}–${formatarMinuto(localSP(bloco.fim).minuto)}`,
      }
    : null;

  const sugestoes = [...usos.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .filter((id) => id !== proximoBloco?.skillId)
    .slice(0, 5)
    .map((id) => ({ id, nome: ativas.get(id)!.nome, cor: ativas.get(id)!.areas.cor, foco: proximoPasso.get(id) ?? "" }));

  return { proximoBloco, sugestoes };
}
