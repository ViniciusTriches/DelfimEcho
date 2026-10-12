// Regras de prática deliberada compartilhadas entre telas e actions.

export type TipoPratica = "ativa" | "passiva";

export type FatorQualidade = { nota: number; fator: number; descricao: string | null };

export const FATOR_PASSIVO_PADRAO = 0.5;

/** Horas efetivas = horas × fator da nota × (fator passivo, se passiva). Igual à view do banco. */
export function horasEfetivas(
  minutos: number,
  nota: number,
  fatores: FatorQualidade[],
  tipo: TipoPratica = "ativa",
  fatorPassivo = FATOR_PASSIVO_PADRAO,
): number {
  const fator = fatores.find((f) => f.nota === nota)?.fator ?? 1;
  return (minutos / 60) * fator * (tipo === "passiva" ? fatorPassivo : 1);
}

/**
 * Sugere a nota de qualidade pela taxa de distrações (por 30 min de prática):
 * 0 → 5 · até 1 → 4 · até 2 → 3 · até 4 → 2 · mais → 1. É só sugestão; a nota é editável.
 */
export function sugerirNota(distracoes: number, minutos: number): number {
  if (distracoes <= 0) return 5;
  const taxa = distracoes / Math.max(minutos / 30, 1);
  if (taxa <= 1) return 4;
  if (taxa <= 2) return 3;
  if (taxa <= 4) return 2;
  return 1;
}

/** Segundos efetivamente cronometrados (desconta pausas). */
export function segundosDoTimer(
  timer: { iniciado_em: string; pausado_em: string | null; segundos_pausados: number },
  agora = Date.now(),
): number {
  const fim = timer.pausado_em ? new Date(timer.pausado_em).getTime() : agora;
  return Math.max(0, (fim - new Date(timer.iniciado_em).getTime()) / 1000 - timer.segundos_pausados);
}
