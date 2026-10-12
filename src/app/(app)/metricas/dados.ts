import "server-only";
import { todasAsLinhas } from "@/lib/supabase/paginar";
import { createClient } from "@/lib/supabase/server";

/** Métricas ativas (opcionalmente de uma área) com seus valores em ordem de data. */
export async function carregarMetricas(areaId?: string | null) {
  const supabase = await createClient();
  let consulta = supabase
    .from("metrics")
    .select("*, areas!inner(nome, cor, ordem, arquivada)")
    .eq("arquivada", false)
    .eq("areas.arquivada", false);
  if (areaId) consulta = consulta.eq("area_id", areaId);
  const { data: metricas } = await consulta;
  if (!metricas?.length) return [];

  const ids = metricas.map((m) => m.id);
  const valores = await todasAsLinhas((de, ate) =>
    supabase
      .from("metric_entries")
      .select("metric_id, data, valor")
      .in("metric_id", ids)
      .order("data")
      .order("id")
      .range(de, ate),
  );

  return metricas
    .sort((a, b) => a.areas.ordem - b.areas.ordem || a.ordem - b.ordem)
    .map((m) => ({
      ...m,
      valores: valores.filter((v) => v.metric_id === m.id).map((v) => ({ data: v.data, valor: Number(v.valor) })),
    }));
}

export type MetricaComValores = Awaited<ReturnType<typeof carregarMetricas>>[number];
