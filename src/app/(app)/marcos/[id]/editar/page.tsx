import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { PageHeader } from "@/components/page-header";
import { hojeSP } from "@/lib/datas";
import { carregarOpcoes } from "@/lib/opcoes";
import { createClient } from "@/lib/supabase/server";
import { ehUuid } from "@/lib/uuid";
import { excluirMarco } from "../../actions";
import { MarcoForm } from "../../marco-form";

export const metadata: Metadata = { title: "Editar marco" };

export default async function EditarMarcoPage({ params }: PageProps<"/marcos/[id]/editar">) {
  const { id } = await params;
  if (!ehUuid(id)) notFound();

  const supabase = await createClient();
  const [{ data: marco }, { areas, skills }] = await Promise.all([
    supabase.from("milestones").select("*").eq("id", id).maybeSingle(),
    carregarOpcoes(),
  ]);
  if (!marco) notFound();

  return (
    <>
      <PageHeader titulo="Editar marco" voltar={{ href: "/marcos", nome: "Marcos" }} />
      <MarcoForm marco={marco} areas={areas} skills={skills} hoje={hojeSP()} voltar="/marcos" />

      <section className="mt-16 max-w-xl rounded-lg border border-outline-variant p-5">
        <h2 className="type-title-medium text-error">Excluir marco</h2>
        <p className="mt-1 mb-4 type-body-medium text-on-surface-variant">Não dá para desfazer.</p>
        <ConfirmButton
          acao={excluirMarco.bind(null, id)}
          confirmar={`Excluir o marco "${marco.titulo}"?`}
          variant="destructive"
        >
          <Trash2Icon />
          Excluir marco
        </ConfirmButton>
      </section>
    </>
  );
}
