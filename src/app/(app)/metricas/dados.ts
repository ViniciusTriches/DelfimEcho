import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Métricas ativas com os dois valores mais recentes (é o que os cartões mostram: último
 * valor e variação). Uma consulta só: os valores vêm embutidos, limitados por métrica.
 */
export async function carregarMetricas(filtro: { areaId?: string | null; soNoInicio?: boolean } = {}) {
  const supabase = await createClient();
  let consulta = supabase
    .from("metrics")
    .select("*, areas!inner(nome, cor, ordem, arquivada), metric_entries(data, valor)")
    .eq("arquivada", false)
    .eq("areas.arquivada", false)
    .order("data", { referencedTable: "metric_entries", ascending: false })
    .order("id", { referencedTable: "metric_entries", ascending: false })
    .limit(2, { referencedTable: "metric_entries" });
  if (filtro.areaId) consulta = consulta.eq("area_id", filtro.areaId);
  if (filtro.soNoInicio) consulta = consulta.eq("no_dashboard", true);
  const { data: metricas } = await consulta;

  return (metricas ?? [])
    .sort((a, b) => a.areas.ordem - b.areas.ordem || a.ordem - b.ordem)
    .map(({ metric_entries, ...m }) => ({
      ...m,
      // Em ordem de data (o anterior antes do último), como o cartão espera.
      valores: [...metric_entries].reverse().map((v) => ({ data: v.data, valor: Number(v.valor) })),
    }));
}

export type MetricaComValores = Awaited<ReturnType<typeof carregarMetricas>>[number];
