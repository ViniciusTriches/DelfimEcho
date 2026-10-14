import "server-only";
import { hojeSP, inicioSemana, somarDias } from "@/lib/datas";
import { DIAS_PRAZO_PROXIMO } from "@/lib/metas";
import { abandonadas, DIAS_ALERTA_PADRAO, heatmap, horasPorArea, horasPorSkill, periodos, type SessaoArea } from "@/lib/painel";
import { lembretesPendentes } from "@/lib/revisoes";
import { todasAsLinhas } from "@/lib/supabase/paginar";
import { createClient } from "@/lib/supabase/server";
import { carregarHabitos, montarChecklist } from "../habitos/dados";
import { carregarMetricas } from "../metricas/dados";

const SEMANAS_HEATMAP = 53;
const DIAS_RADAR = 30;

/** Tudo o que o dashboard mostra, em consultas paralelas. */
export async function carregarPainel() {
  // Ler os cookies (sessão) antes de usar a hora atual: torna a página dinâmica por requisição.
  const supabase = await createClient();
  const hoje = hojeSP();
  const desde = somarDias(inicioSemana(hoje), -7 * (SEMANAS_HEATMAP - 1) - 1);

  const [
    { data: areas },
    { data: skills },
    sessoesBrutas,
    { data: config },
    { data: plano },
    { data: metas },
    { data: timer },
    habitos,
    metricas,
    { data: revisoes },
  ] = await Promise.all([
    supabase.from("areas").select("id, nome, cor, icone").eq("arquivada", false).order("ordem"),
    supabase.from("skills").select("id, nome, area_id, arquivada, destaque_dashboard, criado_em, areas(nome, cor, arquivada)"),
    todasAsLinhas((de, ate) =>
      supabase
        .from("practice_sessions_horas")
        .select("data_local, skill_id, horas_efetivas, horas_brutas")
        .gte("data_local", desde)
        .order("inicio")
        .order("id")
        .range(de, ate),
    ),
    supabase.from("user_settings").select("dias_alerta_abandono").maybeSingle(),
    supabase.from("weekly_plans").select("area_id, horas").eq("semana", inicioSemana(hoje)),
    supabase
      .from("goals")
      .select("id, titulo, prazo, areas(nome, cor)")
      .eq("status", "ativa")
      .not("prazo", "is", null)
      .lte("prazo", somarDias(hoje, DIAS_PRAZO_PROXIMO))
      .order("prazo"),
    supabase.from("active_timer").select("iniciado_em, pausado_em, segundos_pausados, skills(nome)").maybeSingle(),
    carregarHabitos(),
    carregarMetricas({ soNoInicio: true }),
    supabase.from("reviews").select("tipo, periodo_inicio").gte("periodo_inicio", somarDias(hoje, -45)),
  ]);

  const sessoes: SessaoArea[] = sessoesBrutas.map((s) => ({
    data_local: s.data_local!,
    skill_id: s.skill_id!,
    horas_efetivas: Number(s.horas_efetivas),
    horas_brutas: Number(s.horas_brutas),
  }));
  const areaDaSkill = new Map((skills ?? []).map((s) => [s.id, s.area_id]));
  const p = periodos(hoje);

  // Habilidades ativas (de áreas ativas) e a data da última sessão de cada uma.
  const ativas = (skills ?? []).filter((s) => !s.arquivada && !s.areas?.arquivada);
  const ultima = new Map<string, string>();
  sessoes.forEach((s) => {
    if ((ultima.get(s.skill_id) ?? "") < s.data_local) ultima.set(s.skill_id, s.data_local);
  });
  const limiteAlerta = config?.dias_alerta_abandono ?? DIAS_ALERTA_PADRAO;

  const semanaPorSkill = horasPorSkill(sessoes, p.semana);
  const radarDesde = somarDias(hoje, -(DIAS_RADAR - 1));

  return {
    hoje,
    areas: areas ?? [],
    timer,
    checklist: montarChecklist(habitos, hoje, hoje),
    metricas,
    metasProximas: metas ?? [],
    lembretesRevisao: lembretesPendentes(hoje, revisoes ?? []),
    limiteAlerta,
    // Só as sessões dos últimos ~12 meses são carregadas: sem sessão nessa janela e criada
    // antes dela = "mais de um ano" (pode ter havido sessões antes).
    abandonadas: abandonadas(
      ativas.map((s) => ({ id: s.id, nome: s.nome, area: s.areas?.nome ?? "", cor: s.areas?.cor ?? "", criado_em: s.criado_em })),
      ultima,
      hoje,
      limiteAlerta,
    ).map((s) => ({ ...s, maisDeUmAno: !s.ultima && s.criado_em.slice(0, 10) < desde })),
    plano: new Map((plano ?? []).map((x) => [x.area_id, Number(x.horas)])),
    horas: {
      semana: horasPorArea(sessoes, areaDaSkill, p.semana),
      semanaAnterior: horasPorArea(sessoes, areaDaSkill, p.semanaAnterior),
      mes: horasPorArea(sessoes, areaDaSkill, p.mes),
      mesAnterior: horasPorArea(sessoes, areaDaSkill, p.mesAnterior),
      radar: horasPorArea(sessoes, areaDaSkill, { desde: radarDesde, ate: hoje }),
    },
    destaques: ativas
      .filter((s) => s.destaque_dashboard)
      .map((s) => ({ id: s.id, nome: s.nome, horas: semanaPorSkill.get(s.id) ?? { efetivas: 0, brutas: 0 } })),
    heatmap: heatmap(sessoes, hoje, SEMANAS_HEATMAP),
  };
}
