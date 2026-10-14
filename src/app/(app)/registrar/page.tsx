import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/server";
import { FATOR_PASSIVO_PADRAO, segundosDoTimer } from "@/lib/pratica";
import { ehUuid } from "@/lib/uuid";
import { RegistroCliente } from "./registro-form";
import { UltimasSessoes } from "./ultimas-sessoes";

export const metadata: Metadata = { title: "Registrar sessão" };

const DIAS_MAIS_USADAS = 90;
const QTD_MAIS_USADAS = 6;

export default async function RegistrarPage({ searchParams }: PageProps<"/registrar">) {
  const params = await searchParams;
  const habilidadeParam = typeof params.habilidade === "string" ? params.habilidade : undefined;
  const { habilidades, ativas, maisUsadas, proximosPassos, fatores, config, timer, dadosTimer } =
    await carregarDados(params.timer === "1");

  return (
    <>
      <PageHeader
        titulo={dadosTimer ? "Encerrar sessão" : "Registrar sessão"}
        descricao={dadosTimer ? "Confira os dados do timer e salve." : undefined}
      />

      {timer && !dadosTimer && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
          <span>
            Timer ativo: <strong>{timer.skills?.nome}</strong>
          </span>
          <Link href="/timer" className="font-medium text-primary underline-offset-4 hover:underline">
            Abrir timer
          </Link>
        </div>
      )}

      {habilidades.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma habilidade ativa. Crie uma em <Link href="/areas" className="underline">Áreas</Link>.
        </p>
      ) : (
        <RegistroCliente
          habilidades={habilidades}
          maisUsadas={maisUsadas}
          proximosPassos={proximosPassos}
          fatores={(fatores ?? []).map((f) => ({ ...f, fator: Number(f.fator) }))}
          fatorPassivo={Number(config?.fator_pratica_passiva ?? FATOR_PASSIVO_PADRAO)}
          timer={dadosTimer}
          timerAtivo={Boolean(timer)}
          skillInicial={ehUuid(habilidadeParam) && ativas.has(habilidadeParam) ? habilidadeParam : undefined}
        />
      )}

      <Suspense fallback={null}>
        <UltimasSessoes />
      </Suspense>
    </>
  );
}

async function carregarDados(deTimer: boolean) {
  const supabase = await createClient();
  const desde = Date.now() - DIAS_MAIS_USADAS * 86_400_000;

  const [{ data: skills }, { data: recentes }, { data: fatores }, { data: config }, { data: timer }] =
    await Promise.all([
      supabase
        .from("skills")
        .select("id, nome, ordem, permite_pratica_passiva, areas!inner(nome, cor, ordem, arquivada)")
        .eq("arquivada", false)
        .eq("areas.arquivada", false),
      // Últimas sessões: base para "mais usadas" e para o próximo passo de cada habilidade.
      supabase
        .from("practice_sessions")
        .select("skill_id, proximo_passo, inicio")
        .order("inicio", { ascending: false })
        .limit(500),
      supabase.from("quality_factors").select("nota, fator, descricao").order("nota", { ascending: false }),
      supabase.from("user_settings").select("fator_pratica_passiva").maybeSingle(),
      supabase.from("active_timer").select("*, skills(nome)").maybeSingle(),
    ]);

  const habilidades = (skills ?? [])
    .sort((a, b) => a.areas.ordem - b.areas.ordem || a.ordem - b.ordem)
    .map((s) => ({
      id: s.id,
      nome: s.nome,
      area: s.areas.nome,
      cor: s.areas.cor,
      permitePassiva: s.permite_pratica_passiva,
    }));
  const ativas = new Set(habilidades.map((h) => h.id));

  const usos = new Map<string, number>();
  const proximosPassos: Record<string, string> = {};
  for (const s of recentes ?? []) {
    if (!ativas.has(s.skill_id)) continue;
    if (new Date(s.inicio).getTime() >= desde) usos.set(s.skill_id, (usos.get(s.skill_id) ?? 0) + 1);
    // A primeira ocorrência é a sessão mais recente da habilidade.
    if (!(s.skill_id in proximosPassos)) proximosPassos[s.skill_id] = s.proximo_passo ?? "";
  }
  const maisUsadas = [...usos.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, QTD_MAIS_USADAS)
    .map(([id]) => id);

  const dadosTimer =
    deTimer && timer
      ? {
          id: timer.id,
          skillId: timer.skill_id,
          inicio: timer.iniciado_em,
          fim: timer.pausado_em ?? new Date().toISOString(),
          minutos: Math.max(1, Math.round(segundosDoTimer(timer) / 60)),
          foco: timer.foco_especifico ?? "",
          distracoes: timer.distracoes,
        }
      : null;

  return { habilidades, ativas, maisUsadas, proximosPassos, fatores, config, timer, dadosTimer };
}
