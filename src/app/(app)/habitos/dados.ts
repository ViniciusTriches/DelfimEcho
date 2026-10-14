import "server-only";
import { inicioSemana, somarDias } from "@/lib/datas";
import { descreverFrequencia, previsto, sequenciaAtual } from "@/lib/habitos";
import { todasAsLinhas } from "@/lib/supabase/paginar";
import { createClient } from "@/lib/supabase/server";
import type { ItemChecklist } from "./checklist";

/**
 * Hábitos ativos e os dias feitos de cada um. As duas consultas saem juntas (uma ida ao
 * banco): os registros vêm filtrados pelos hábitos ativos via join, sem esperar a lista.
 * Registros anteriores ao início de um hábito não contam nas regras (lib/habitos).
 */
export async function carregarHabitos() {
  const supabase = await createClient();
  const [{ data: habitos }, logs] = await Promise.all([
    supabase
      .from("habits")
      .select("id, nome, frequencia, dias_semana, inicio, areas(cor)")
      .eq("ativo", true)
      .order("ordem"),
    todasAsLinhas((de, ate) =>
      supabase
        .from("habit_logs")
        .select("habit_id, data, habits!inner(ativo)")
        .eq("concluido", true)
        .eq("habits.ativo", true)
        .order("data")
        .order("habit_id")
        .range(de, ate),
    ),
  ]);
  if (!habitos?.length) return { habitos: [], feitos: new Map<string, Set<string>>() };

  const feitos = new Map<string, Set<string>>(habitos.map((h) => [h.id, new Set()]));
  logs.forEach((l) => feitos.get(l.habit_id)?.add(l.data));
  return { habitos, feitos };
}

export type HabitosCarregados = Awaited<ReturnType<typeof carregarHabitos>>;

/** Itens do checklist de um dia (com sequência e mini semana). */
export function montarChecklist({ habitos, feitos }: HabitosCarregados, dia: string, hoje: string): ItemChecklist[] {
  const semana = inicioSemana(dia);
  return habitos.map((h) => {
    const f = feitos.get(h.id)!;
    return {
      id: h.id,
      nome: h.nome,
      cor: h.areas?.cor ?? null,
      frequencia: descreverFrequencia(h),
      previsto: previsto(h, dia),
      feito: f.has(dia),
      sequencia: sequenciaAtual(h, f, hoje),
      semana: Array.from({ length: 7 }, (_, i) => {
        const d = somarDias(semana, i);
        return { dia: d, previsto: previsto(h, d), feito: f.has(d), futuro: d > hoje };
      }),
    };
  });
}
