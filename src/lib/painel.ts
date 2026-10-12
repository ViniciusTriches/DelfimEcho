// Cálculos do dashboard. Funções puras sobre dias "AAAA-MM-DD" em São Paulo.

import { diasEntre, inicioSemana, mesDe, somarDias, somarMeses } from "@/lib/datas";

export const DIAS_ALERTA_PADRAO = 10;

export type SessaoArea = { data_local: string; skill_id: string; horas_efetivas: number; horas_brutas: number };
export type Horas = { efetivas: number; brutas: number };
export type Intervalo = { desde: string; ate: string };

/** Período atual e o "mesmo ponto" do período anterior (comparação justa no meio da semana/mês). */
export function periodos(hoje: string) {
  const semana = inicioSemana(hoje);
  const mes = `${mesDe(hoje)}-01`;
  const mesAnterior = `${somarMeses(mesDe(hoje), -1)}-01`;
  const ultimoDiaAnterior = somarDias(mes, -1);
  const mesmoDiaAnterior = `${mesAnterior.slice(0, 8)}${hoje.slice(8)}`;
  return {
    semana: { desde: semana, ate: hoje },
    semanaAnterior: { desde: somarDias(semana, -7), ate: somarDias(hoje, -7) },
    mes: { desde: mes, ate: hoje },
    mesAnterior: { desde: mesAnterior, ate: mesmoDiaAnterior < ultimoDiaAnterior ? mesmoDiaAnterior : ultimoDiaAnterior },
  };
}

/** Horas por área num intervalo (inclusive). */
export function horasPorArea(sessoes: SessaoArea[], areaDaSkill: Map<string, string>, { desde, ate }: Intervalo) {
  const porArea = new Map<string, Horas>();
  for (const s of sessoes) {
    if (s.data_local < desde || s.data_local > ate) continue;
    const area = areaDaSkill.get(s.skill_id);
    if (!area) continue;
    const h = porArea.get(area) ?? { efetivas: 0, brutas: 0 };
    h.efetivas += s.horas_efetivas;
    h.brutas += s.horas_brutas;
    porArea.set(area, h);
  }
  return porArea;
}

/** Horas por habilidade num intervalo (ex.: destaque do Padel na semana). */
export function horasPorSkill(sessoes: SessaoArea[], { desde, ate }: Intervalo) {
  const porSkill = new Map<string, Horas>();
  for (const s of sessoes) {
    if (s.data_local < desde || s.data_local > ate) continue;
    const h = porSkill.get(s.skill_id) ?? { efetivas: 0, brutas: 0 };
    h.efetivas += s.horas_efetivas;
    h.brutas += s.horas_brutas;
    porSkill.set(s.skill_id, h);
  }
  return porSkill;
}

export type DiaCalor = { dia: string; horas: number; nivel: 0 | 1 | 2 | 3 | 4; futuro: boolean };

/** Nível do heatmap pelas horas efetivas do dia. */
export function nivelCalor(horas: number): DiaCalor["nivel"] {
  if (horas <= 0) return 0;
  if (horas < 0.5) return 1;
  if (horas < 1.5) return 2;
  if (horas < 3) return 3;
  return 4;
}

/** Colunas de semanas (segunda a domingo) terminando na semana de hoje. */
export function heatmap(sessoes: SessaoArea[], hoje: string, semanas: number): DiaCalor[][] {
  const porDia = new Map<string, number>();
  sessoes.forEach((s) => porDia.set(s.data_local, (porDia.get(s.data_local) ?? 0) + s.horas_efetivas));
  const primeira = somarDias(inicioSemana(hoje), -7 * (semanas - 1));
  return Array.from({ length: semanas }, (_, c) =>
    Array.from({ length: 7 }, (_, l) => {
      const dia = somarDias(primeira, c * 7 + l);
      const horas = porDia.get(dia) ?? 0;
      return { dia, horas, nivel: nivelCalor(horas), futuro: dia > hoje };
    }),
  );
}

export type SkillAlerta = { id: string; nome: string; area: string; cor: string; criado_em: string };

/**
 * Habilidades sem sessão há `limite` dias ou mais. `dias` = null quando nunca houve sessão
 * (aí conta desde a criação da habilidade).
 */
export function abandonadas(skills: SkillAlerta[], ultimaSessao: Map<string, string>, hoje: string, limite: number) {
  return skills
    .map((s) => {
      const ultima = ultimaSessao.get(s.id);
      const dias = diasEntre(ultima ?? s.criado_em.slice(0, 10), hoje);
      return { ...s, ultima: ultima ?? null, dias };
    })
    .filter((s) => s.dias >= limite)
    .sort((a, b) => b.dias - a.dias);
}
