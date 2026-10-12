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
        <p className="text-sm text-muted-foreground">Nenhuma área ainda. Crie a primeira.</p>
      )}

      <ul className="flex flex-col gap-2">
        {ativas.map((area, i) => {
          const n = qtdSkills.get(area.id) ?? 0;
          return (
            <li
              key={area.id}
              className="flex items-center gap-2 rounded-xl border bg-card p-2 pl-3 transition-colors hover:bg-muted/50"
            >
              <Link href={`/areas/${area.id}`} className="flex min-w-0 flex-1 items-center gap-3 py-1">
                <AreaIcon icone={area.icone} cor={area.cor} />
                <div className="min-w-0">
                  <p className="truncate font-medium">{area.nome}</p>
                  <p className="truncate text-sm text-muted-foreground">
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
        <details className="mt-8">
          <summary className="cursor-pointer text-sm text-muted-foreground">
            Arquivadas ({arquivadas.length})
          </summary>
          <ul className="mt-3 flex flex-col gap-2">
            {arquivadas.map((area) => (
              <li key={area.id} className="flex items-center gap-3 rounded-xl border p-2 pl-3 opacity-70">
                <Link href={`/areas/${area.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <AreaIcon icone={area.icone} cor={area.cor} />
                  <span className="truncate">{area.nome}</span>
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
