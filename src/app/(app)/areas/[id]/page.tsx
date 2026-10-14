import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  PlusIcon,
} from "lucide-react";
import { AreaIcon } from "@/components/area-icon";
import { ConfirmButton } from "@/components/confirm-button";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatarHoras } from "@/lib/formato";
import { createClient } from "@/lib/supabase/server";
import { NOMES_PERIODO, type Periodo } from "@/lib/tipos";
import { ehUuid } from "@/lib/uuid";
import { arquivarHabilidade, moverHabilidade } from "../../habilidades/actions";
import { arquivarArea } from "../actions";
import { SecoesCarregando, SecoesDaArea } from "./secoes";

export async function generateMetadata({ params }: PageProps<"/areas/[id]">): Promise<Metadata> {
  const { id } = await params;
  if (!ehUuid(id)) return {};
  const supabase = await createClient();
  const { data } = await supabase.from("areas").select("nome").eq("id", id).maybeSingle();
  return { title: data?.nome ?? "Área" };
}

export default async function AreaPage({ params }: PageProps<"/areas/[id]">) {
  const { id } = await params;
  if (!ehUuid(id)) notFound();

  const supabase = await createClient();
  const [{ data: area }, { data: skills }] = await Promise.all([
    supabase.from("areas").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("skills")
      .select("*, skill_levels(horas_acumuladas_alvo), periodic_targets(horas_alvo, periodo)")
      .eq("area_id", id)
      .order("ordem")
      .order("criado_em"),
  ]);
  if (!area) notFound();

  const ativas = skills?.filter((s) => !s.arquivada) ?? [];
  const arquivadas = skills?.filter((s) => s.arquivada) ?? [];

  function resumo(skill: NonNullable<typeof skills>[number]) {
    if (skill.tipo_meta_tempo === "niveis") {
      const n = skill.skill_levels.length;
      if (!n) return "Níveis ainda não definidos";
      const max = Math.max(...skill.skill_levels.map((l) => l.horas_acumuladas_alvo));
      return `${n} níve${n > 1 ? "is" : "l"} · até ${formatarHoras(max)}`;
    }
    if (skill.tipo_meta_tempo === "periodica") {
      if (!skill.periodic_targets.length) return "Meta periódica não definida";
      return skill.periodic_targets
        .map((t) => `${formatarHoras(t.horas_alvo)}/${NOMES_PERIODO[t.periodo as Periodo]}`)
        .join(" · ");
    }
    return "Sem meta de tempo";
  }

  return (
    <>
      <PageHeader
        titulo={area.nome}
        descricao={area.arquivada ? "Área arquivada" : area.descricao}
        voltar={{ href: "/areas", nome: "Áreas" }}
        icone={<AreaIcon icone={area.icone} cor={area.cor} className="size-11" />}
        acoes={
          <>
            <Link href={`/areas/${id}/editar`} className={buttonVariants({ variant: "outline" })}>
              <PencilIcon />
              Editar
            </Link>
            {area.arquivada ? (
              <ConfirmButton acao={arquivarArea.bind(null, id, false)} variant="outline">
                <ArchiveRestoreIcon />
                Restaurar
              </ConfirmButton>
            ) : (
              <ConfirmButton
                acao={arquivarArea.bind(null, id, true)}
                confirmar={`Arquivar "${area.nome}"? Ela sai das listas e do dashboard, mas nada é apagado.`}
                variant="outline"
              >
                <ArchiveIcon />
                Arquivar
              </ConfirmButton>
            )}
          </>
        }
      />

      <section>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="type-title-large text-on-surface">Habilidades</h2>
          <Link href={`/habilidades/nova?area=${id}`} className={buttonVariants({ variant: "secondary", size: "sm" })}>
            <PlusIcon />
            Nova habilidade
          </Link>
        </div>

        {ativas.length === 0 && (
          <p className="rounded-lg bg-surface-container-low p-6 type-body-large text-on-surface-variant">Nenhuma habilidade nesta área ainda.</p>
        )}

        <ul className="flex flex-col gap-2">
          {ativas.map((skill, i) => (
            <li
              key={skill.id}
              className="camada-estado flex items-center gap-2 rounded-lg bg-surface-container-low py-2 pr-2 pl-4"
            >
              <Link href={`/habilidades/${skill.id}`} className="flex min-h-14 min-w-0 flex-1 flex-col justify-center py-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="type-title-medium text-on-surface">{skill.nome}</span>
                  {skill.destaque_dashboard && <Badge variant="secondary">No início</Badge>}
                </div>
                <p className="type-body-medium text-on-surface-variant">
                  {resumo(skill)}
                  {skill.horas_iniciais > 0 && ` · ${formatarHoras(skill.horas_iniciais)} antes do Echo`}
                  {skill.nivel_atual_autoavaliado && ` · autoavaliação ${skill.nivel_atual_autoavaliado}/10`}
                </p>
              </Link>
              <div className="flex flex-col">
                <ConfirmButton
                  acao={moverHabilidade.bind(null, skill.id, "cima")}
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Mover ${skill.nome} para cima`}
                  disabled={i === 0}
                >
                  <ChevronUpIcon />
                </ConfirmButton>
                <ConfirmButton
                  acao={moverHabilidade.bind(null, skill.id, "baixo")}
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Mover ${skill.nome} para baixo`}
                  disabled={i === ativas.length - 1}
                >
                  <ChevronDownIcon />
                </ConfirmButton>
              </div>
            </li>
          ))}
        </ul>

        {arquivadas.length > 0 && (
          <details className="group mt-6">
            <summary className="camada-estado flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 rounded-full px-3 type-label-large text-on-surface-variant [&::-webkit-details-marker]:hidden"><ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" aria-hidden />
              Habilidades arquivadas ({arquivadas.length})
            </summary>
            <ul className="mt-3 flex flex-col gap-2">
              {arquivadas.map((skill) => (
                <li key={skill.id} className="flex items-center gap-4 rounded-lg border border-outline-variant py-2 pr-2 pl-4 text-on-surface-variant">
                  <Link href={`/habilidades/${skill.id}`} className="min-w-0 flex-1 truncate type-body-large">
                    {skill.nome}
                  </Link>
                  <ConfirmButton
                    acao={arquivarHabilidade.bind(null, skill.id, false)}
                    variant="outline"
                    size="sm"
                  >
                    <ArchiveRestoreIcon />
                    Restaurar
                  </ConfirmButton>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      <Suspense fallback={<SecoesCarregando />}>
        <SecoesDaArea areaId={id} />
      </Suspense>
    </>
  );
}
