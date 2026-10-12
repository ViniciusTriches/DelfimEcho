// Períodos das revisões semanal e mensal. Dias "AAAA-MM-DD" em São Paulo.

import { diaDaSemana } from "@/lib/habitos";
import { inicioSemana, mesDe, somarDias, somarMeses } from "@/lib/datas";

export type TipoRevisao = "semanal" | "mensal";
export type Periodo = { desde: string; ate: string };

export const DIAS_LEMBRETE_SEMANA = 3; // seg a qua: ainda lembra da semana anterior
export const DIAS_LEMBRETE_MES = 7; // dias 1 a 7: lembra do mês anterior

/** Semana a revisar por padrão: no domingo, a atual; nos outros dias, a anterior. */
export function semanaParaRevisar(hoje: string): string {
  const atual = inicioSemana(hoje);
  return diaDaSemana(hoje) === 7 ? atual : somarDias(atual, -7);
}

/** Mês a revisar por padrão: nos primeiros 7 dias, o anterior; depois, o atual. */
export function mesParaRevisar(hoje: string): string {
  return Number(hoje.slice(8)) <= DIAS_LEMBRETE_MES ? somarMeses(mesDe(hoje), -1) : mesDe(hoje);
}

export const periodoSemana = (segunda: string): Periodo => ({ desde: segunda, ate: somarDias(segunda, 6) });

export function periodoMes(mes: string): Periodo {
  const desde = `${mes}-01`;
  return { desde, ate: somarDias(`${somarMeses(mes, 1)}-01`, -1) };
}

/**
 * Lembretes do início: semana (do domingo até quarta seguinte) e mês (dias 1 a 7 do mês seguinte),
 * se a revisão daquele período ainda não existe.
 */
export function lembretesPendentes(hoje: string, feitas: { tipo: string; periodo_inicio: string }[]) {
  const existe = (tipo: TipoRevisao, inicio: string) =>
    feitas.some((r) => r.tipo === tipo && r.periodo_inicio === inicio);

  const lembretes: { tipo: TipoRevisao; inicio: string }[] = [];
  const dow = diaDaSemana(hoje);
  if (dow === 7 || dow <= DIAS_LEMBRETE_SEMANA) {
    const semana = semanaParaRevisar(hoje);
    if (!existe("semanal", semana)) lembretes.push({ tipo: "semanal", inicio: semana });
  }
  if (Number(hoje.slice(8)) <= DIAS_LEMBRETE_MES) {
    const mes = `${somarMeses(mesDe(hoje), -1)}-01`;
    if (!existe("mensal", mes)) lembretes.push({ tipo: "mensal", inicio: mes });
  }
  return lembretes;
}

/** Semana alvo do "Planejar próxima semana": a seguinte à revisada, mas nunca no passado. */
export function semanaParaPlanejar(semanaRevisada: string, hoje: string): string {
  const seguinte = somarDias(semanaRevisada, 7);
  const atual = inicioSemana(hoje);
  return seguinte < atual ? atual : seguinte;
}

/** Semanas que podem ser planejadas: a atual e a próxima. */
export function semanasPlanejaveis(hoje: string): [string, string] {
  const atual = inicioSemana(hoje);
  return [atual, somarDias(atual, 7)];
}
