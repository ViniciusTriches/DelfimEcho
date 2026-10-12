import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/server";
import { ehUuid } from "@/lib/uuid";
import { excluirArea } from "../../actions";
import { AreaForm } from "../../area-form";

export const metadata: Metadata = { title: "Editar área" };

export default async function EditarAreaPage({ params }: PageProps<"/areas/[id]/editar">) {
  const { id } = await params;
  if (!ehUuid(id)) notFound();

  const supabase = await createClient();
  const { data: area } = await supabase.from("areas").select("*").eq("id", id).maybeSingle();
  if (!area) notFound();

  const { data: skills } = await supabase.from("skills").select("id").eq("area_id", id);
  const skillIds = skills?.map((s) => s.id) ?? [];
  const { count: sessoes } = skillIds.length
    ? await supabase
        .from("practice_sessions")
        .select("id", { count: "exact", head: true })
        .in("skill_id", skillIds)
    : { count: 0 };

  const aviso =
    `Excluir a área "${area.nome}" apaga para sempre ${skillIds.length} habilidade(s), ` +
    `${sessoes ?? 0} sessão(ões) de prática e as metas, métricas e marcos dela.\n\n` +
    `Se quiser só tirar da frente, use "Arquivar". Excluir mesmo assim?`;

  return (
    <>
      <PageHeader titulo="Editar área" voltar={{ href: `/areas/${id}`, nome: area.nome }} />
      <AreaForm area={area} cancelarHref={`/areas/${id}`} />

      <section className="mt-12 max-w-xl rounded-xl border border-destructive/30 p-4">
        <h2 className="font-medium">Excluir área</h2>
        <p className="mt-1 mb-3 text-sm text-muted-foreground">
          Apaga a área com {skillIds.length} habilidade(s) e {sessoes ?? 0} sessão(ões) de prática.
          Não dá para desfazer.
        </p>
        <ConfirmButton acao={excluirArea.bind(null, id)} confirmar={aviso} variant="destructive">
          <Trash2Icon />
          Excluir área
        </ConfirmButton>
      </section>
    </>
  );
}
