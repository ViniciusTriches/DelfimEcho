import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveRestoreIcon, ChevronDownIcon, ChevronUpIcon, PlusIcon } from "lucide-react";
import { AreaIcon } from "@/components/area-icon";
import { ConfirmButton } from "@/components/confirm-button";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { arquivarArea, moverArea } from "./actions";

export const metadata: Metadata = { title: "Áreas" };

export default async function AreasPage() {
  const supabase = await createClient();
  const [{ data: areas }, { data: skills }] = await Promise.all([
    supabase.from("areas").select("*").order("ordem").order("criado_em"),
    supabase.from("skills").select("area_id").eq("arquivada", false),
  ]);

  const qtdSkills = new Map<string, number>();
  skills?.forEach((s) => qtdSkills.set(s.area_id, (qtdSkills.get(s.area_id) ?? 0) + 1));

  const ativas = areas?.filter((a) => !a.arquivada) ?? [];
  const arquivadas = areas?.filter((a) => a.arquivada) ?? [];

  return (
    <>
      <PageHeader
        titulo="Áreas"
        descricao="As grandes frentes da sua vida e as habilidades de cada uma."
        acoes={
          <Link href="/areas/nova" className={buttonVariants()}>
            <PlusIcon />
            Nova área
          </Link>
        }
      />

      {ativas.length === 0 && (
        <p className="rounded-lg bg-surface-container-low p-6 type-body-large text-on-surface-variant">Nenhuma área ainda. Crie a primeira: trabalho, saúde, idiomas…</p>
      )}

      <ul className="flex flex-col gap-2">
        {ativas.map((area, i) => {
          const n = qtdSkills.get(area.id) ?? 0;
          return (
            <li
              key={area.id}
              className="camada-estado flex items-center gap-2 rounded-lg bg-surface-container-low py-2 pr-2 pl-4"
            >
              <Link href={`/areas/${area.id}`} className="flex min-h-14 min-w-0 flex-1 items-center gap-4 py-1">
                <AreaIcon icone={area.icone} cor={area.cor} />
                <div className="min-w-0">
                  <p className="truncate type-title-medium text-on-surface">{area.nome}</p>
                  <p className="truncate type-body-medium text-on-surface-variant">
                    {n === 0 ? "Sem habilidades" : `${n} habilidade${n > 1 ? "s" : ""}`}
                    {area.descricao && ` · ${area.descricao}`}
                  </p>
                </div>
              </Link>
              <div className="flex flex-col">
                <ConfirmButton
                  acao={moverArea.bind(null, area.id, "cima")}
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Mover ${area.nome} para cima`}
                  disabled={i === 0}
                >
                  <ChevronUpIcon />
                </ConfirmButton>
                <ConfirmButton
                  acao={moverArea.bind(null, area.id, "baixo")}
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Mover ${area.nome} para baixo`}
                  disabled={i === ativas.length - 1}
                >
                  <ChevronDownIcon />
                </ConfirmButton>
              </div>
            </li>
          );
        })}
      </ul>

      {arquivadas.length > 0 && (
        <details className="group mt-10">
          <summary className="camada-estado flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 rounded-full px-3 type-label-large text-on-surface-variant [&::-webkit-details-marker]:hidden"><ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" aria-hidden />
            Arquivadas ({arquivadas.length})
          </summary>
          <ul className="mt-3 flex flex-col gap-2">
            {arquivadas.map((area) => (
              <li key={area.id} className="flex items-center gap-4 rounded-lg border border-outline-variant py-2 pr-2 pl-4 text-on-surface-variant">
                <Link href={`/areas/${area.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <AreaIcon icone={area.icone} cor={area.cor} />
                  <span className="truncate type-body-large">{area.nome}</span>
                </Link>
                <ConfirmButton acao={arquivarArea.bind(null, area.id, false)} variant="outline" size="sm">
                  <ArchiveRestoreIcon />
                  Restaurar
                </ConfirmButton>
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  );
}
