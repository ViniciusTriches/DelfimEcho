import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { PageHeader } from "@/components/page-header";
import { hojeSP } from "@/lib/datas";
import { createClient } from "@/lib/supabase/server";
import { ehUuid } from "@/lib/uuid";
import { excluirHabito } from "../../actions";
import { HabitoForm } from "../../habito-form";

export const metadata: Metadata = { title: "Editar hábito" };

export default async function EditarHabitoPage({ params }: PageProps<"/habitos/[id]/editar">) {
  const { id } = await params;
  if (!ehUuid(id)) notFound();

  const supabase = await createClient();
  const [{ data: habito }, { data: areas }, { count: registros }] = await Promise.all([
    supabase.from("habits").select("*").eq("id", id).maybeSingle(),
    supabase.from("areas").select("id, nome").eq("arquivada", false).order("ordem"),
    supabase.from("habit_logs").select("id", { count: "exact", head: true }).eq("habit_id", id),
  ]);
  if (!habito) notFound();

  return (
    <>
      <PageHeader titulo="Editar hábito" voltar={{ href: "/habitos/gerenciar", nome: "Gerenciar hábitos" }} />
      <HabitoForm habito={habito} areas={areas ?? []} hoje={hojeSP()} />

      <section className="mt-16 max-w-xl rounded-lg border border-outline-variant p-5">
        <h2 className="type-title-medium text-error">Excluir hábito</h2>
        <p className="mt-1 mb-4 type-body-medium text-on-surface-variant">
          Apaga o hábito e {registros ?? 0} dia(s) marcados. Para só parar de acompanhar, use &quot;Pausar&quot; em
          Gerenciar hábitos.
        </p>
        <ConfirmButton
          acao={excluirHabito.bind(null, id)}
          confirmar={`Excluir "${habito.nome}" e ${registros ?? 0} dia(s) marcados? Não dá para desfazer.`}
          variant="destructive"
        >
          <Trash2Icon />
          Excluir hábito
        </ConfirmButton>
      </section>
    </>
  );
}
