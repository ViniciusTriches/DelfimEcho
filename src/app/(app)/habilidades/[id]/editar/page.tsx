import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchiveIcon, ArchiveRestoreIcon, PlusCircleIcon, Trash2Icon } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { ehUuid } from "@/lib/uuid";
import { arquivarHabilidade, excluirHabilidade } from "../../actions";
import { SkillForm } from "../../skill-form";

export const metadata: Metadata = { title: "Editar habilidade" };

export default async function EditarHabilidadePage({ params }: PageProps<"/habilidades/[id]/editar">) {
  const { id } = await params;
  if (!ehUuid(id)) notFound();

  const supabase = await createClient();
  const [{ data: habilidade }, { data: niveis }, { data: metas }, { count: sessoes }] = await Promise.all([
    supabase.from("skills").select("*, areas(id, nome, arquivada)").eq("id", id).maybeSingle(),
    supabase.from("skill_levels").select("*").eq("skill_id", id).order("ordem"),
    supabase.from("periodic_targets").select("*").eq("skill_id", id),
    supabase.from("practice_sessions").select("id", { count: "exact", head: true }).eq("skill_id", id),
  ]);
  if (!habilidade) notFound();

  // Áreas ativas + a área atual (mesmo se estiver arquivada).
  const { data: areasAtivas } = await supabase
    .from("areas")
    .select("id, nome")
    .eq("arquivada", false)
    .order("ordem");
  const areaAtual = habilidade.areas;
  const areas = [...(areasAtivas ?? [])];
  if (areaAtual && !areas.some((a) => a.id === areaAtual.id)) areas.push(areaAtual);

  const metaDe = (periodo: string) => metas?.find((m) => m.periodo === periodo)?.horas_alvo;
  const voltar = { href: `/areas/${habilidade.area_id}`, nome: areaAtual?.nome ?? "Área" };

  return (
    <>
      <PageHeader
        titulo={habilidade.nome}
        descricao={habilidade.arquivada ? "Habilidade arquivada" : "Editar habilidade"}
        voltar={voltar}
        acoes={
          <>
            {!habilidade.arquivada && (
              <Link href={`/registrar?habilidade=${id}`} className={buttonVariants()}>
                <PlusCircleIcon />
                Registrar sessão
              </Link>
            )}
            {habilidade.arquivada ? (
              <ConfirmButton acao={arquivarHabilidade.bind(null, id, false)} variant="outline">
                <ArchiveRestoreIcon />
                Restaurar
              </ConfirmButton>
            ) : (
              <ConfirmButton
                acao={arquivarHabilidade.bind(null, id, true)}
                confirmar={`Arquivar "${habilidade.nome}"? Ela some das listas, mas o histórico é mantido.`}
                variant="outline"
              >
                <ArchiveIcon />
                Arquivar
              </ConfirmButton>
            )}
          </>
        }
      />

      <SkillForm
        habilidade={habilidade}
        areas={areas}
        niveisIniciais={(niveis ?? []).map((n) => ({
          id: n.id,
          nome: n.nome_nivel,
          horas: n.horas_acumuladas_alvo,
          fonte: n.fonte_referencia ?? "",
        }))}
        metasIniciais={{ semana: metaDe("semana"), mes: metaDe("mes") }}
        cancelarHref={voltar.href}
      />

      <section className="mt-12 max-w-2xl rounded-xl border border-destructive/30 p-4">
        <h2 className="font-medium">Excluir habilidade</h2>
        <p className="mt-1 mb-3 text-sm text-muted-foreground">
          Apaga a habilidade, seus níveis e {sessoes ?? 0} sessão(ões) de prática. Não dá para desfazer.
        </p>
        <ConfirmButton
          acao={excluirHabilidade.bind(null, id)}
          confirmar={
            `Excluir "${habilidade.nome}" apaga para sempre ${sessoes ?? 0} sessão(ões) de prática, ` +
            `níveis e autoavaliações.\n\nSe quiser só tirar da frente, use "Arquivar". Excluir mesmo assim?`
          }
          variant="destructive"
        >
          <Trash2Icon />
          Excluir habilidade
        </ConfirmButton>
      </section>
    </>
  );
}
