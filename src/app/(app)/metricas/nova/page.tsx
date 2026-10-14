import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { carregarOpcoes, parametroUuid } from "@/lib/opcoes";
import { MetricaForm } from "../metrica-form";

export const metadata: Metadata = { title: "Nova métrica" };

export default async function NovaMetricaPage({ searchParams }: PageProps<"/metricas/nova">) {
  const area = parametroUuid((await searchParams).area);
  const { areas } = await carregarOpcoes();
  const voltar = area ? `/areas/${area}` : "/metricas";

  return (
    <>
      <PageHeader titulo="Nova métrica" voltar={{ href: voltar, nome: area ? "Área" : "Métricas" }} />
      {areas.length ? (
        <MetricaForm areas={areas} areaInicial={area} voltar={voltar} />
      ) : (
        <p className="type-body-medium text-on-surface-variant">
          Crie uma <Link href="/areas/nova" className="underline">área</Link> primeiro.
        </p>
      )}
    </>
  );
}
