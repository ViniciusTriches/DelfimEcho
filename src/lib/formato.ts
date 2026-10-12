const HORAS = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

/** 1500 → "1.500 h"; 0.5 → "0,5 h". */
export function formatarHoras(horas: number): string {
  return `${HORAS.format(horas)} h`;
}
