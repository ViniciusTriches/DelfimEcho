import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { PageHeader } from "@/components/page-header";
import { carregarOpcoes } from "@/lib/opcoes";
import { createClient } from "@/lib/supabase/server";
import { ehUuid } from "@/lib/uuid";
import { excluirMeta } from "../../actions";
import { MetaForm } from "../../meta-form";

export const metadata: Metadata = { title: "Editar meta" };

export default async function EditarMetaPage({ params }: PageProps<"/metas/[id]/editar">) {
  const { id } = await params;
  if (!ehUuid(id)) notFound();

  const supabase = await createClient();
  const [{ data: meta }, { areas, skills }] = await Promise.all([
    supabase.from("goals").select("*").eq("id", id).maybeSingle(),
    carregarOpcoes(),
  ]);
  if (!meta) notFound();

  return (
    <>
      <PageHeader titulo="Editar meta" voltar={{ href: "/metas", nome: "Metas" }} />
      <MetaForm meta={meta} areas={areas} skills={skills} voltar="/metas" />

      <section className="mt-16 max-w-xl rounded-lg border border-outline-variant p-5">
        <h2 className="type-title-medium text-error">Excluir meta</h2>
        <p className="mt-1 mb-4 type-body-medium text-on-surface-variant">
          Se desistiu, prefira &quot;Abandonar&quot;: ela fica no histórico. Excluir não dá para desfazer.
        </p>
        <ConfirmButton
          acao={excluirMeta.bind(null, id)}
          confirmar={`Excluir a meta "${meta.titulo}"?`}
          variant="destructive"
        >
          <Trash2Icon />
          Excluir meta
        </ConfirmButton>
      </section>
    </>
  );
}
