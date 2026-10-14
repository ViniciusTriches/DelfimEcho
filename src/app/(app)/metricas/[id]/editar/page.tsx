import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchiveIcon, ArchiveRestoreIcon, Trash2Icon } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { PageHeader } from "@/components/page-header";
import { carregarOpcoes } from "@/lib/opcoes";
import { createClient } from "@/lib/supabase/server";
import { ehUuid } from "@/lib/uuid";
import { arquivarMetrica, excluirMetrica } from "../../actions";
import { MetricaForm } from "../../metrica-form";

export const metadata: Metadata = { title: "Editar métrica" };

export default async function EditarMetricaPage({ params }: PageProps<"/metricas/[id]/editar">) {
  const { id } = await params;
  if (!ehUuid(id)) notFound();

  const supabase = await createClient();
  const [{ data: metrica }, { areas }, { count: valores }] = await Promise.all([
    supabase.from("metrics").select("*").eq("id", id).maybeSingle(),
    carregarOpcoes(),
    supabase.from("metric_entries").select("id", { count: "exact", head: true }).eq("metric_id", id),
  ]);
  if (!metrica) notFound();

  return (
    <>
      <PageHeader
        titulo="Editar métrica"
        voltar={{ href: `/metricas/${id}`, nome: metrica.nome }}
        acoes={
          metrica.arquivada ? (
            <ConfirmButton acao={arquivarMetrica.bind(null, id, false)} variant="outline">
              <ArchiveRestoreIcon />
              Restaurar
            </ConfirmButton>
          ) : (
            <ConfirmButton
              acao={arquivarMetrica.bind(null, id, true)}
              confirmar={`Arquivar "${metrica.nome}"? Ela sai das listas; os valores ficam guardados.`}
              variant="outline"
            >
              <ArchiveIcon />
              Arquivar
            </ConfirmButton>
          )
        }
      />
      <MetricaForm metrica={metrica} areas={areas} voltar={`/metricas/${id}`} />

      <section className="mt-16 max-w-xl rounded-lg border border-outline-variant p-5">
        <h2 className="type-title-medium text-error">Excluir métrica</h2>
        <p className="mt-1 mb-4 type-body-medium text-on-surface-variant">
          Apaga a métrica e {valores ?? 0} valor(es) registrados. Não dá para desfazer.
        </p>
        <ConfirmButton
          acao={excluirMetrica.bind(null, id)}
          confirmar={`Excluir "${metrica.nome}" e ${valores ?? 0} valor(es)?`}
          variant="destructive"
        >
          <Trash2Icon />
          Excluir métrica
        </ConfirmButton>
      </section>
    </>
  );
}
