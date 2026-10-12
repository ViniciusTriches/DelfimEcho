// Formatação e leitura de métricas (peso, faturamento, clientes…).

const NUM = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** 1234.5 + "R$" → "R$ 1.234,50"; 72.4 + "kg" → "72,4 kg"; 18 + "%" → "18%"; 12 + "qtd" → "12". */
export function formatarValor(valor: number, unidade?: string | null): string {
  const u = unidade?.trim();
  if (u === "R$") return BRL.format(valor);
  if (!u || u.toLowerCase() === "qtd") return NUM.format(valor);
  if (u === "%") return `${NUM.format(valor)}%`;
  return `${NUM.format(valor)} ${u}`;
}

export type Direcao = "maior_melhor" | "menor_melhor";

/** Variação entre o último valor e o anterior, já dizendo se foi para o lado bom. */
export function tendencia(ultimo: number, anterior: number | undefined, direcao: Direcao) {
  if (anterior === undefined) return null;
  const delta = ultimo - anterior;
  if (delta === 0) return { delta, melhorou: null as boolean | null };
  return { delta, melhorou: direcao === "maior_melhor" ? delta > 0 : delta < 0 };
}

/** Situação em relação à meta: atingida ou quanto falta. */
export function situacaoMeta(ultimo: number, meta: number | null, direcao: Direcao) {
  if (meta === null) return null;
  const atingida = direcao === "maior_melhor" ? ultimo >= meta : ultimo <= meta;
  return { atingida, falta: Math.abs(meta - ultimo) };
}
