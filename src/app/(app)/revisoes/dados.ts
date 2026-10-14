import "server-only";
import { deInputLocal, hojeSP, mesDe, somarDias, somarMeses } from "@/lib/datas";
import { somarTaxas, taxa } from "@/lib/habitos";
import { type Direcao, tendencia } from "@/lib/metricas";
import { horasPorArea, type SessaoArea } from "@/lib/painel";
import { type Periodo, periodoMes, type TipoRevisao } from "@/lib/revisoes";
import { todasAsLinhas } from "@/lib/supabase/paginar";
import { createClient } from "@/lib/supabase/server";
import { carregarHabitos } from "../habitos/dados";

const QTD_MELHORES_SESSOES = 5;

/** Início do dia em São Paulo como ISO (para comparar com timestamps). */
const inicioDoDia = (dia: string) => deInputLocal(`${dia}T00:00`)!.toISOString();

/** Tudo o que o resumo automático de uma revisão mostra. */
export async function carregarResumo(tipo: TipoRevisao, p: Periodo) {
  const supabase = await createClient();
  const hoje = hojeSP();
  const anterior: Periodo =
    tipo === "semanal"
      ? { desde: somarDias(p.desde, -7), ate: somarDias(p.ate, -7) }
      : periodoMes(somarMeses(mesDe(p.desde), -1));

  const [
    { data: areas },
    { data: skills },
    sessoesBrutas,
    { data: plano },
    { data: concluidas },
    { data: pendentes },
    { data: marcos },
    { data: metricas },
    valores,
    { data: revisao },
    habitos,
  ] = await Promise.all([
    supabase.from("areas").select("id, nome, cor").eq("arquivada", false).order("ordem"),
    supabase.from("skills").select("id, nome, area_id"),
    todasAsLinhas((de, ate) =>
      supabase
        .from("practice_sessions_horas")
        .select("id, skill_id, data_local, inicio, duracao_minutos, nota_qualidade, horas_efetivas, horas_brutas, foco_especifico, aprendizado")
        .gte("data_local", anterior.desde)
        .lte("data_local", p.ate)
        .order("inicio")
        .order("id")
        .range(de, ate),
    ),
    tipo === "semanal"
      ? supabase.from("weekly_plans").select("area_id, horas").eq("semana", p.desde)
      : Promise.resolve({ data: [] as { area_id: string; horas: number }[] }),
    supabase
      .from("goals")
      .select("id, titulo, concluida_em, areas(nome, cor)")
      .eq("status", "concluida")
      .gte("concluida_em", inicioDoDia(p.desde))
      .lt("concluida_em", inicioDoDia(somarDias(p.ate, 1)))
      .order("concluida_em"),
    supabase
      .from("goals")
      .select("id, titulo, prazo, areas(nome, cor)")
      .eq("status", "ativa")
      .not("prazo", "is", null)
      .lte("prazo", p.ate)
      .order("prazo"),
    supabase
      .from("milestones")
      .select("id, titulo, descricao, data, areas(nome, cor), skills(nome)")
      .gte("data", p.desde)
      .lte("data", p.ate)
      .order("data", { ascending: false }),
    supabase.from("metrics").select("id, nome, unidade, direcao, areas(nome, cor)").eq("arquivada", false).order("ordem"),
    todasAsLinhas((de, ate) =>
      supabase
        .from("metric_entries")
        .select("metric_id, data, valor")
        .gte("data", p.desde)
        .lte("data", p.ate)
        .order("data")
        .order("id")
        .range(de, ate),
    ),
    supabase.from("reviews").select("*").eq("tipo", tipo).eq("periodo_inicio", p.desde).maybeSingle(),
    carregarHabitos(),
  ]);

  const areaDaSkill = new Map((skills ?? []).map((s) => [s.id, s.area_id]));
  const nomeDaSkill = new Map((skills ?? []).map((s) => [s.id, s.nome]));
  const sessoes: (SessaoArea & (typeof sessoesBrutas)[number])[] = sessoesBrutas.map((s) => ({
    ...s,
    data_local: s.data_local!,
    skill_id: s.skill_id!,
    horas_efetivas: Number(s.horas_efetivas),
    horas_brutas: Number(s.horas_brutas),
  }));
  const doPeriodo = sessoes.filter((s) => s.data_local >= p.desde);

  // Hábitos: cumprimento no período (até hoje, se o período não acabou).
  const ateHabitos = p.ate < hoje ? p.ate : hoje;
  const taxasHabitos = habitos.habitos.map((h) => ({
    id: h.id,
    nome: h.nome,
    taxa: taxa(h, habitos.feitos.get(h.id)!, p.desde, ateHabitos, hoje),
  }));

  // Métricas: primeiro e último valor no período.
  const metricasDoPeriodo = (metricas ?? [])
    .map((m) => {
      const vs = valores.filter((v) => v.metric_id === m.id).map((v) => ({ data: v.data, valor: Number(v.valor) }));
      if (!vs.length) return null;
      const primeiro = vs[0];
      const ultimo = vs.at(-1)!;
      return {
        ...m,
        registros: vs.length,
        primeiro,
        ultimo,
        variacao: vs.length > 1 ? tendencia(ultimo.valor, primeiro.valor, m.direcao as Direcao) : null,
      };
    })
    .filter((m) => m !== null);

  return {
    hoje,
    areas: areas ?? [],
    horas: horasPorArea(doPeriodo, areaDaSkill, p),
    horasAnterior: horasPorArea(sessoes, areaDaSkill, anterior),
    plano: new Map((plano ?? []).map((x) => [x.area_id, Number(x.horas)])),
    totalSessoes: doPeriodo.length,
    melhoresSessoes: [...doPeriodo]
      .sort((a, b) => b.nota_qualidade! - a.nota_qualidade! || b.horas_efetivas - a.horas_efetivas)
      .slice(0, QTD_MELHORES_SESSOES)
      .map((s) => ({ ...s, habilidade: nomeDaSkill.get(s.skill_id) ?? "—" })),
    habitos: taxasHabitos,
    habitosGeral: somarTaxas(taxasHabitos.map((t) => t.taxa)),
    metasConcluidas: concluidas ?? [],
    metasPendentes: pendentes ?? [],
    marcos: marcos ?? [],
    metricas: metricasDoPeriodo,
    revisao,
  };
}

export type Resumo = Awaited<ReturnType<typeof carregarResumo>>;
