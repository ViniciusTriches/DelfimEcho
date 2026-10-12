// Regras de hábitos. Funções puras sobre dias "AAAA-MM-DD" (calendário de São Paulo).

import { diasEntre, somarDias } from "@/lib/datas";

export type HabitoRegra = {
  frequencia: string; // "diario" | "dias_semana"
  dias_semana: number[] | null; // 1 = segunda … 7 = domingo
  inicio: string;
};

export const NOMES_DIAS = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"]; // índice 0 = segunda

/** Dia da semana ISO (1 = segunda … 7 = domingo). */
export function diaDaSemana(dia: string): number {
  const d = new Date(`${dia}T00:00:00Z`).getUTCDay();
  return d === 0 ? 7 : d;
}

/** O hábito estava previsto para este dia? (frequência + a partir do início) */
export function previsto(h: HabitoRegra, dia: string): boolean {
  if (dia < h.inicio) return false;
  return h.frequencia === "diario" || (h.dias_semana ?? []).includes(diaDaSemana(dia));
}

/** "Todos os dias" ou "seg, qua, sex". */
export function descreverFrequencia(h: Pick<HabitoRegra, "frequencia" | "dias_semana">): string {
  if (h.frequencia === "diario") return "Todos os dias";
  const dias = [...(h.dias_semana ?? [])].sort();
  if (dias.length === 5 && dias.every((d, i) => d === i + 1)) return "Dias úteis";
  return dias.map((d) => NOMES_DIAS[d - 1]).join(", ");
}

/**
 * Sequência atual: dias previstos seguidos com o hábito feito, contando para trás.
 * Se hoje está previsto e ainda não foi feito, a sequência não quebra: conta a partir de ontem.
 */
export function sequenciaAtual(h: HabitoRegra, feitos: Set<string>, hoje: string): number {
  let dia = previsto(h, hoje) && !feitos.has(hoje) ? somarDias(hoje, -1) : hoje;
  let n = 0;
  while (dia >= h.inicio) {
    if (previsto(h, dia)) {
      if (!feitos.has(dia)) break;
      n++;
    }
    dia = somarDias(dia, -1);
  }
  return n;
}

/** Maior sequência desde o início do hábito até hoje. */
export function melhorSequencia(h: HabitoRegra, feitos: Set<string>, hoje: string): number {
  let melhor = 0;
  let atual = 0;
  const total = diasEntre(h.inicio, hoje);
  for (let i = 0; i <= total; i++) {
    const dia = somarDias(h.inicio, i);
    if (!previsto(h, dia)) continue;
    if (feitos.has(dia)) melhor = Math.max(melhor, ++atual);
    else if (dia !== hoje) atual = 0; // hoje ainda pode ser feito
  }
  return melhor;
}

export type Taxa = { feitos: number; previstos: number; fracao: number | null };

/**
 * Cumprimento entre `desde` e `ate` (inclusive): feitos / previstos. Null se nada previsto.
 * `hoje`, se informado e ainda não feito, fica de fora (o dia não acabou).
 */
export function taxa(h: HabitoRegra, feitos: Set<string>, desde: string, ate: string, hoje?: string): Taxa {
  let previstos = 0;
  let feitosNoPeriodo = 0;
  for (let dia = desde; dia <= ate; dia = somarDias(dia, 1)) {
    if (!previsto(h, dia) || (dia === hoje && !feitos.has(dia))) continue;
    previstos++;
    if (feitos.has(dia)) feitosNoPeriodo++;
  }
  return { feitos: feitosNoPeriodo, previstos, fracao: previstos ? feitosNoPeriodo / previstos : null };
}

/** Soma as taxas de vários hábitos (cumprimento geral). */
export function somarTaxas(taxas: Taxa[]): Taxa {
  const feitos = taxas.reduce((t, x) => t + x.feitos, 0);
  const previstos = taxas.reduce((t, x) => t + x.previstos, 0);
  return { feitos, previstos, fracao: previstos ? feitos / previstos : null };
}
