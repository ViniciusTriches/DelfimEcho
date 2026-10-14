import "server-only";
import { type BlocoBanco, expandirBlocos, HORA_FIM_PADRAO, HORA_INICIO_PADRAO, type Ocorrencia } from "@/lib/calendario";
import { inicioSemana, somarDias } from "@/lib/datas";
import { todasAsLinhas } from "@/lib/supabase/paginar";
import { createClient } from "@/lib/supabase/server";

export type HabilidadeCal = { id: string; nome: string; area: string; areaId: string; cor: string; ativa: boolean };

export type BlocoCal = Ocorrencia & { tipo: "bloco" };
export type SessaoCal = {
  tipo: "sessao";
  id: string;
  skillId: string;
  inicio: string;
  fim: string;
  minutos: number;
  nota: number;
  horasEfetivas: number;
  foco: string | null;
  /** Dia (São Paulo) da sessão, como no resto do app. */
  data: string;
};
export type DiaInteiro = { tipo: "meta" | "marco"; id: string; titulo: string; data: string; href: string };
export type ResumoArea = { areaId: string; nome: string; cor: string; plano: number | null; agendado: number; realizado: number };

const COLUNAS_BLOCO = "id, skill_id, inicio, fim, observacao, repete_dias, repete_ate, datas_excluidas";

/** Blocos (com séries) que podem ter ocorrências entre `de` e `ate`. Duas consultas em paralelo. */
export async function carregarBlocos(de: string, ate: string): Promise<BlocoCal[]> {
  const supabase = await createClient();
  // Avulsos: começam no intervalo (com um dia de folga por causa do fuso).
  const [avulsos, series] = await Promise.all([
    supabase
      .from("planned_blocks")
      .select(COLUNAS_BLOCO)
      .is("repete_dias", null)
      .gte("inicio", `${somarDias(de, -1)}T00:00:00Z`)
      .lt("inicio", `${somarDias(ate, 2)}T00:00:00Z`),
    supabase
      .from("planned_blocks")
      .select(COLUNAS_BLOCO)
      .not("repete_dias", "is", null)
      .lt("inicio", `${somarDias(ate, 2)}T00:00:00Z`)
      .or(`repete_ate.is.null,repete_ate.gte.${de}`),
  ]);
  const blocos = [...(avulsos.data ?? []), ...(series.data ?? [])] as BlocoBanco[];
  return expandirBlocos(blocos, de, ate).map((o) => ({ ...o, tipo: "bloco" as const }));
}

/** Tudo o que a grade (dia/semana) ou o mês precisam, entre `de` e `ate`. */
export async function carregarCalendario(de: string, ate: string) {
  const supabase = await createClient();
  const semana = inicioSemana(de);

  const [blocos, { data: skills }, sessoes, { data: metas }, { data: marcos }, { data: config }, { data: plano }] =
    await Promise.all([
      carregarBlocos(de, ate),
      supabase.from("skills").select("id, nome, area_id, arquivada, areas(nome, cor, ordem, arquivada)").order("ordem"),
      todasAsLinhas((i, f) =>
        supabase
          .from("practice_sessions_horas")
          .select("id, skill_id, inicio, fim, duracao_minutos, nota_qualidade, horas_efetivas, foco_especifico, data_local")
          .gte("data_local", somarDias(de, -1))
          .lte("data_local", ate)
          .order("inicio")
          .order("id")
          .range(i, f),
      ),
      supabase
        .from("goals")
        .select("id, titulo, prazo")
        .eq("status", "ativa")
        .gte("prazo", de)
        .lte("prazo", ate),
      supabase.from("milestones").select("id, titulo, data").gte("data", de).lte("data", ate),
      supabase.from("user_settings").select("calendario_hora_inicio, calendario_hora_fim").maybeSingle(),
      supabase.from("weekly_plans").select("area_id, horas").eq("semana", semana),
    ]);

  const habilidades: HabilidadeCal[] = (skills ?? [])
    .filter((s) => s.areas)
    .sort((a, b) => a.areas!.ordem - b.areas!.ordem)
    .map((s) => ({
      id: s.id,
      nome: s.nome,
      area: s.areas!.nome,
      areaId: s.area_id,
      cor: s.areas!.cor,
      ativa: !s.arquivada && !s.areas!.arquivada,
    }));

  const sessoesCal: SessaoCal[] = sessoes
    .filter((s) => s.inicio && s.fim)
    .map((s) => ({
      tipo: "sessao",
      id: s.id!,
      skillId: s.skill_id!,
      inicio: s.inicio!,
      fim: s.fim!,
      minutos: s.duracao_minutos!,
      nota: s.nota_qualidade!,
      horasEfetivas: Number(s.horas_efetivas),
      foco: s.foco_especifico,
      data: s.data_local!,
    }));

  const diaInteiro: DiaInteiro[] = [
    ...(metas ?? []).map((m) => ({ tipo: "meta" as const, id: m.id, titulo: m.titulo, data: m.prazo!, href: "/metas" })),
    ...(marcos ?? []).map((m) => ({ tipo: "marco" as const, id: m.id, titulo: m.titulo, data: m.data, href: `/marcos/${m.id}/editar` })),
  ];

  return {
    blocos,
    sessoes: sessoesCal,
    habilidades,
    diaInteiro,
    faixa: {
      inicio: config?.calendario_hora_inicio ?? HORA_INICIO_PADRAO,
      fim: config?.calendario_hora_fim ?? HORA_FIM_PADRAO,
    },
    plano: new Map((plano ?? []).map((p) => [p.area_id, Number(p.horas)])),
  };
}

/** Plano × agendado × realizado por área numa semana (segunda `semana` até domingo). */
export function resumirSemana(
  semana: string,
  dados: Pick<Awaited<ReturnType<typeof carregarCalendario>>, "blocos" | "sessoes" | "habilidades" | "plano">,
): ResumoArea[] {
  const fim = somarDias(semana, 6);
  const daSkill = new Map(dados.habilidades.map((h) => [h.id, h]));
  const areas = new Map(dados.habilidades.map((h) => [h.areaId, { nome: h.area, cor: h.cor }]));
  const linhas = new Map<string, ResumoArea>();
  const linha = (areaId: string) => {
    const a = areas.get(areaId);
    if (!a) return null;
    if (!linhas.has(areaId))
      linhas.set(areaId, { areaId, nome: a.nome, cor: a.cor, plano: dados.plano.get(areaId) ?? null, agendado: 0, realizado: 0 });
    return linhas.get(areaId)!;
  };

  dados.plano.forEach((_, areaId) => linha(areaId));
  for (const b of dados.blocos) {
    const h = daSkill.get(b.skillId);
    if (!h || b.data < semana || b.data > fim) continue;
    const l = linha(h.areaId);
    if (l) l.agendado += (new Date(b.fim).getTime() - new Date(b.inicio).getTime()) / 3_600_000;
  }
  for (const s of dados.sessoes) {
    const h = daSkill.get(s.skillId);
    if (!h || s.data < semana || s.data > fim) continue;
    const l = linha(h.areaId);
    if (l) l.realizado += s.horasEfetivas;
  }
  const ordem = [...areas.keys()];
  return [...linhas.values()].sort((a, b) => ordem.indexOf(a.areaId) - ordem.indexOf(b.areaId));
}
