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

      <section className="mt-12 max-w-xl rounded-xl border border-destructive/30 p-4">
        <h2 className="font-medium">Excluir meta</h2>
        <p className="mt-1 mb-3 text-sm text-muted-foreground">
          Se desistiu, prefira &quot;Abandonar&quot;: ela fica no histórico. Excluir não dá para desfazer.
        </p>
        <ConfirmButton
          acao={excluirMeta.bind(null, id)}
          confirmar={`Excluir a meta "${meta.titulo}"?`}
          variant="destructive"
          className="min-h-11 sm:min-h-8"
        >
          <Trash2Icon />
          Excluir meta
        </ConfirmButton>
      </section>
    </>
  );
}
