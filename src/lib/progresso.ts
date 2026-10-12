// Cálculos de progresso de uma habilidade. Funções puras: recebem as sessões
// (da view practice_sessions_horas) e "hoje" em São Paulo.

import { formatarDiaMes, formatarMesCurto, inicioSemana, mesDe, somarDias, somarMeses } from "@/lib/datas";

export type SessaoHoras = {
  data_local: string; // "AAAA-MM-DD" em São Paulo
  duracao_minutos: number;
  horas_brutas: number;
  horas_efetivas: number;
  nota_qualidade: number;
};

export type Nivel = { nome: string; horas: number };

const soma = (lista: SessaoHoras[], campo: "horas_brutas" | "horas_efetivas") =>
  lista.reduce((t, s) => t + s[campo], 0);

/** Horas desde `desde` (inclusive) até `ate` (inclusive), dias "AAAA-MM-DD". */
export function horasNoPeriodo(sessoes: SessaoHoras[], desde: string, ate: string) {
  const doPeriodo = sessoes.filter((s) => s.data_local >= desde && s.data_local <= ate);
  return { efetivas: soma(doPeriodo, "horas_efetivas"), brutas: soma(doPeriodo, "horas_brutas"), sessoes: doPeriodo.length };
}

export const DIAS_RITMO = 28;

/** Horas efetivas por semana, na média das últimas 4 semanas (28 dias até hoje). */
export function ritmoSemanal(sessoes: SessaoHoras[], hoje: string): number {
  return horasNoPeriodo(sessoes, somarDias(hoje, -(DIAS_RITMO - 1)), hoje).efetivas / (DIAS_RITMO / 7);
}

/** Onde o total está na escada de níveis (ordenada por horas crescentes). */
export function progressoNiveis(niveis: Nivel[], total: number) {
  const ordenados = [...niveis].sort((a, b) => a.horas - b.horas);
  const atingidos = ordenados.filter((n) => total >= n.horas);
  const atual = atingidos.at(-1) ?? null;
  const proximo = ordenados.find((n) => total < n.horas) ?? null;
  return {
    niveis: ordenados,
    atual,
    proximo,
    // Barra: horas acumuladas vs. alvo do próximo nível.
    fracao: proximo ? total / proximo.horas : 1,
    faltam: proximo ? proximo.horas - total : 0,
  };
}

/** Quando o próximo alvo é atingido no ritmo atual. Null se o ritmo é zero. */
export function estimativa(faltam: number, ritmoPorSemana: number, hoje: string) {
  if (faltam <= 0 || ritmoPorSemana <= 0) return null;
  const semanas = faltam / ritmoPorSemana;
  return { semanas, data: somarDias(hoje, Math.ceil(semanas * 7)) };
}

export type PontoSemana = {
  semana: string; // segunda-feira "AAAA-MM-DD"
  rotulo: string; // "12/10"
  efetivas: number;
  brutas: number;
  notaMedia: number | null; // média ponderada pela duração
  sessoes: number;
};

/** Últimas `n` semanas (segunda a domingo), terminando na semana atual. */
export function seriesSemanais(sessoes: SessaoHoras[], hoje: string, n = 12): PontoSemana[] {
  const atual = inicioSemana(hoje);
  return Array.from({ length: n }, (_, i) => {
    const semana = somarDias(atual, -7 * (n - 1 - i));
    const daSemana = sessoes.filter((s) => s.data_local >= semana && s.data_local <= somarDias(semana, 6));
    const minutos = daSemana.reduce((t, s) => t + s.duracao_minutos, 0);
    return {
      semana,
      rotulo: formatarDiaMes(semana),
      efetivas: soma(daSemana, "horas_efetivas"),
      brutas: soma(daSemana, "horas_brutas"),
      notaMedia: minutos ? daSemana.reduce((t, s) => t + s.nota_qualidade * s.duracao_minutos, 0) / minutos : null,
      sessoes: daSemana.length,
    };
  });
}

export type PontoMes = { mes: string; rotulo: string; efetivas: number; brutas: number };

/** Últimos `n` meses, terminando no mês atual. */
export function seriesMensais(sessoes: SessaoHoras[], hoje: string, n = 6): PontoMes[] {
  const atual = mesDe(hoje);
  return Array.from({ length: n }, (_, i) => {
    const mes = somarMeses(atual, -(n - 1 - i));
    const doMes = sessoes.filter((s) => mesDe(s.data_local) === mes);
    return { mes, rotulo: formatarMesCurto(mes), efetivas: soma(doMes, "horas_efetivas"), brutas: soma(doMes, "horas_brutas") };
  });
}

/** Nota média ponderada pela duração. */
export function notaMedia(sessoes: SessaoHoras[]): number | null {
  const minutos = sessoes.reduce((t, s) => t + s.duracao_minutos, 0);
  return minutos ? sessoes.reduce((t, s) => t + s.nota_qualidade * s.duracao_minutos, 0) / minutos : null;
}
