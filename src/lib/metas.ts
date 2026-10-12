import { diasEntre } from "@/lib/datas";

export type StatusMeta = "ativa" | "concluida" | "abandonada";

export const STATUS_META: { valor: StatusMeta; nome: string }[] = [
  { valor: "ativa", nome: "Ativas" },
  { valor: "concluida", nome: "Concluídas" },
  { valor: "abandonada", nome: "Abandonadas" },
];

export const DIAS_PRAZO_PROXIMO = 14;

/** Situação do prazo de uma meta ativa em relação a hoje. */
export function descreverPrazo(prazo: string | null, hoje: string) {
  if (!prazo) return { texto: "Sem prazo", tom: "neutro" as const };
  const dias = diasEntre(hoje, prazo);
  if (dias < 0) return { texto: `Atrasada há ${-dias} ${dias === -1 ? "dia" : "dias"}`, tom: "atrasada" as const };
  if (dias === 0) return { texto: "Vence hoje", tom: "proxima" as const };
  if (dias === 1) return { texto: "Vence amanhã", tom: "proxima" as const };
  if (dias <= DIAS_PRAZO_PROXIMO) return { texto: `Faltam ${dias} dias`, tom: "proxima" as const };
  return { texto: `Faltam ${dias} dias`, tom: "neutro" as const };
}
