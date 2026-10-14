import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { FiltroAreas } from "@/components/filtro-areas";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { corArea } from "@/lib/cores-area";
import { carregarOpcoes, parametroUuid } from "@/lib/opcoes";
import { createClient } from "@/lib/supabase/server";
import { carregarMetricas } from "./dados";
import { MetricaCard } from "./metrica-card";

export const metadata: Metadata = { title: "Métricas" };

export default async function MetricasPage({ searchParams }: PageProps<"/metricas">) {
  const area = parametroUuid((await searchParams).area);
  const supabase = await createClient();
  const [metricas, { areas }, { data: arquivadas }] = await Promise.all([
    carregarMetricas({ areaId: area }),
    carregarOpcoes(),
    supabase.from("metrics").select("id, nome").eq("arquivada", true).order("nome"),
  ]);
  const areasComMetricas = [...new Set(metricas.map((m) => m.area_id))];

  return (
    <>
      <PageHeader
        titulo="Métricas"
        descricao="Registre valores e acompanhe a tendência de cada um."
        acoes={
          <Link href={area ? `/metricas/nova?area=${area}` : "/metricas/nova"} className={buttonVariants()}>
            <PlusIcon />
            Nova métrica
          </Link>
        }
      />
      <FiltroAreas areas={areas} atual={area} href={(a) => (a ? `/metricas?area=${a}` : "/metricas")} />

      {metricas.length === 0 ? (
        <p className="rounded-lg bg-surface-container-low p-6 type-body-large text-on-surface-variant">Nenhuma métrica{area ? " nesta área" : ""} ainda.</p>
      ) : (
        <div className="flex flex-col gap-12">
          {areasComMetricas.map((areaId) => {
            const daArea = metricas.filter((m) => m.area_id === areaId);
            return (
              <section key={areaId} aria-labelledby={`area-${areaId}`}>
                <h2 id={`area-${areaId}`} className="mb-4 flex items-center gap-2 type-title-large text-on-surface">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: corArea(daArea[0].areas.cor) }} aria-hidden />
                  {daArea[0].areas.nome}
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {daArea.map((m) => (
                    <MetricaCard key={m.id} metrica={m} mostrarArea={false} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {arquivadas && arquivadas.length > 0 && (
        <details className="group mt-12">
          <summary className="camada-estado flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 rounded-full px-3 type-label-large text-on-surface-variant [&::-webkit-details-marker]:hidden"><ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" aria-hidden />Arquivadas ({arquivadas.length})</summary>
          <ul className="mt-2 flex flex-col gap-1 type-body-medium">
            {arquivadas.map((m) => (
              <li key={m.id}>
                <Link href={`/metricas/${m.id}`} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
                  {m.nome}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  );
}
