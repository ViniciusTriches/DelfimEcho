import type { Database } from "@/lib/database.types";

type Tabelas = Database["public"]["Tables"];
export type Linha<T extends keyof Tabelas> = Tabelas[T]["Row"];

export type Area = Linha<"areas">;
export type Habilidade = Linha<"skills">;
export type NivelHabilidade = Linha<"skill_levels">;
export type MetaPeriodica = Linha<"periodic_targets">;

export type TipoMetaTempo = "niveis" | "periodica" | "nenhuma";
export type Periodo = "semana" | "mes";

export const TIPOS_META_TEMPO: { valor: TipoMetaTempo; nome: string; descricao: string }[] = [
  {
    valor: "niveis",
    nome: "Níveis",
    descricao: "Horas acumuladas até cada nível (ex.: A1 → C2).",
  },
  {
    valor: "periodica",
    nome: "Periódica",
    descricao: "Meta de horas por semana ou por mês (ex.: 4h/semana).",
  },
  { valor: "nenhuma", nome: "Nenhuma", descricao: "Só registra as horas, sem meta de tempo." },
];

export const NOMES_PERIODO: Record<Periodo, string> = { semana: "semana", mes: "mês" };
