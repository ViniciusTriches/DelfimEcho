import "server-only";
import { inicioSemana, somarDias } from "@/lib/datas";
import { descreverFrequencia, previsto, sequenciaAtual } from "@/lib/habitos";
import { todasAsLinhas } from "@/lib/supabase/paginar";
import { createClient } from "@/lib/supabase/server";
import type { ItemChecklist } from "./checklist";

/** Hábitos ativos e os dias feitos de cada um (desde o início mais antigo, ou `desde` se for antes). */
export async function carregarHabitos(hoje: string, desde?: string) {
  const supabase = await createClient();
  const { data: habitos } = await supabase
    .from("habits")
    .select("id, nome, frequencia, dias_semana, inicio, areas(cor)")
    .eq("ativo", true)
    .order("ordem");
  if (!habitos?.length) return { habitos: [], feitos: new Map<string, Set<string>>() };

  const maisAntigo = habitos.reduce((min, h) => (h.inicio < min ? h.inicio : min), hoje);
  const inicio = desde && desde < maisAntigo ? desde : maisAntigo;
  const logs = await todasAsLinhas((de, ate) =>
    supabase
      .from("habit_logs")
      .select("habit_id, data")
      .eq("concluido", true)
      .gte("data", inicio)
      .order("data")
      .order("habit_id")
      .range(de, ate),
  );

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
