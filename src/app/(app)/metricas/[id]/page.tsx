import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { GraficoLinha } from "@/components/graficos";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { formatarDia, formatarDiaMes, hojeSP } from "@/lib/datas";
import { formatarValor } from "@/lib/metricas";
import { todasAsLinhas } from "@/lib/supabase/paginar";
import { createClient } from "@/lib/supabase/server";
import { ehUuid } from "@/lib/uuid";
import { excluirValor } from "../actions";
import { ValorForm } from "../valor-form";

export async function generateMetadata({ params }: PageProps<"/metricas/[id]">): Promise<Metadata> {
  const { id } = await params;
  if (!ehUuid(id)) return {};
  const supabase = await createClient();
  const { data } = await supabase.from("metrics").select("nome").eq("id", id).maybeSingle();
  return { title: data?.nome ?? "Métrica" };
}

export default async function MetricaPage({ params }: PageProps<"/metricas/[id]">) {
  const { id } = await params;
  if (!ehUuid(id)) notFound();

  const supabase = await createClient();
  const [{ data: metrica }, valores] = await Promise.all([
    supabase.from("metrics").select("*, areas(nome)").eq("id", id).maybeSingle(),
    todasAsLinhas((de, ate) =>
      supabase.from("metric_entries").select("*").eq("metric_id", id).order("data").order("id").range(de, ate),
    ),
  ]);
  if (!metrica) notFound();

  const meta = metrica.meta_valor === null ? null : Number(metrica.meta_valor);
  const pontos = valores.map((v) => ({
    rotulo: formatarDiaMes(v.data),
    titulo: formatarDia(v.data),
    valor: Number(v.valor),
  }));

  return (
    <>
      <PageHeader
        titulo={metrica.nome}
        descricao={[
          metrica.areas?.nome,
          metrica.direcao === "menor_melhor" ? "quanto menor, melhor" : "quanto maior, melhor",
          meta !== null ? `meta ${formatarValor(meta, metrica.unidade)}` : null,
          metrica.arquivada ? "arquivada" : null,
        ]
          .filter(Boolean)
          .join(" · ")}
        voltar={{ href: "/metricas", nome: "Métricas" }}
        acoes={
          <Link href={`/metricas/${id}/editar`} className={buttonVariants({ variant: "outline" })}>
            <PencilIcon />
            Editar
          </Link>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="titulo-evolucao" className="min-w-0 rounded-lg bg-surface-container-low p-5">
          <h2 id="titulo-evolucao" className="mb-4 type-title-large text-on-surface">
            Evolução
          </h2>
          {pontos.length >= 2 ? (
            <GraficoLinha dados={pontos} nome={metrica.nome} unidade={metrica.unidade} meta={meta} />
          ) : (
            <p className="type-body-medium text-on-surface-variant">
              O gráfico aparece a partir de 2 valores registrados.
            </p>
          )}
        </section>

        <section aria-labelledby="titulo-registrar" className="rounded-lg bg-surface-container-low p-5 lg:self-start">
          <h2 id="titulo-registrar" className="mb-4 type-title-large text-on-surface">
            Registrar valor
          </h2>
          <ValorForm metricId={id} nome={metrica.nome} unidade={metrica.unidade} hoje={hojeSP()} completo />
        </section>
      </div>

      <section aria-labelledby="titulo-historico" className="mt-12 max-w-2xl">
        <h2 id="titulo-historico" className="mb-4 type-title-large text-on-surface">
          Histórico
        </h2>
        {valores.length === 0 ? (
          <p className="rounded-lg border border-dashed border-outline-variant px-4 py-5 type-body-medium text-on-surface-variant">Nenhum valor registrado.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-outline-variant overflow-hidden rounded-lg bg-surface-container-low py-1">
            {[...valores].reverse().map((v) => (
              <li key={v.id} className="flex min-h-14 items-center gap-4 py-2 pr-2 pl-4 type-body-medium">
                <span className="w-28 shrink-0 text-on-surface-variant">{formatarDia(v.data)}</span>
                <span className="min-w-0 flex-1">
                  <span className="numero type-title-medium text-on-surface">{formatarValor(Number(v.valor), metrica.unidade)}</span>
                  {v.observacao && <span className="block truncate text-on-surface-variant">{v.observacao}</span>}
                </span>
                <ConfirmButton
                  acao={excluirValor.bind(null, v.id)}
                  confirmar="Excluir este valor?"
                  variant="ghost"
                  className="text-on-surface-variant"
                  size="icon"
                  aria-label={`Excluir valor de ${formatarDia(v.data)}`}
                >
                  <Trash2Icon />
                </ConfirmButton>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
