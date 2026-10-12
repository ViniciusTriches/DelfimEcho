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

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="titulo-evolucao">
          <h2 id="titulo-evolucao" className="mb-3 text-lg font-semibold">
            Evolução
          </h2>
          {pontos.length >= 2 ? (
            <GraficoLinha dados={pontos} nome={metrica.nome} unidade={metrica.unidade} meta={meta} />
          ) : (
            <p className="text-sm text-muted-foreground">
              O gráfico aparece a partir de 2 valores registrados.
            </p>
          )}
        </section>

        <section aria-labelledby="titulo-registrar">
          <h2 id="titulo-registrar" className="mb-3 text-lg font-semibold">
            Registrar valor
          </h2>
          <ValorForm metricId={id} nome={metrica.nome} unidade={metrica.unidade} hoje={hojeSP()} completo />
        </section>
      </div>

      <section aria-labelledby="titulo-historico" className="mt-10 max-w-2xl">
        <h2 id="titulo-historico" className="mb-3 text-lg font-semibold">
          Histórico
        </h2>
        {valores.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum valor registrado.</p>
        ) : (
          <ul className="flex flex-col divide-y rounded-xl border">
            {[...valores].reverse().map((v) => (
              <li key={v.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                <span className="w-28 shrink-0 text-muted-foreground">{formatarDia(v.data)}</span>
                <span className="min-w-0 flex-1">
                  <span className="font-medium tabular-nums">{formatarValor(Number(v.valor), metrica.unidade)}</span>
                  {v.observacao && <span className="block truncate text-muted-foreground">{v.observacao}</span>}
                </span>
                <ConfirmButton
                  acao={excluirValor.bind(null, v.id)}
                  confirmar="Excluir este valor?"
                  variant="ghost"
                  size="icon"
                  className="size-11 sm:size-8"
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
