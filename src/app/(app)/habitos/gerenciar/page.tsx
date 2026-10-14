import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDownIcon, ChevronUpIcon, PauseIcon, PencilIcon, PlayIcon, PlusIcon } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { formatarDia } from "@/lib/datas";
import { descreverFrequencia } from "@/lib/habitos";
import { createClient } from "@/lib/supabase/server";
import { corArea } from "@/lib/cores-area";
import { alternarAtivo, moverHabito } from "../actions";

export const metadata: Metadata = { title: "Gerenciar hábitos" };

export default async function GerenciarHabitosPage() {
  const supabase = await createClient();
  const { data: habitos } = await supabase
    .from("habits")
    .select("id, nome, frequencia, dias_semana, inicio, ativo, areas(nome, cor)")
    .order("ordem");

  const ativos = habitos?.filter((h) => h.ativo) ?? [];
  const pausados = habitos?.filter((h) => !h.ativo) ?? [];

  return (
    <>
      <PageHeader
        titulo="Gerenciar hábitos"
        voltar={{ href: "/habitos", nome: "Hábitos" }}
        acoes={
          <Link href="/habitos/novo" className={buttonVariants()}>
            <PlusIcon />
            Novo hábito
          </Link>
        }
      />

      {ativos.length === 0 && (
        <p className="max-w-2xl rounded-lg bg-surface-container-low p-6 type-body-large text-on-surface-variant">Nenhum hábito ativo.</p>
      )}

      <ul className="flex max-w-2xl flex-col gap-2">
        {ativos.map((h, i) => (
          <li key={h.id} className="flex items-center gap-1 rounded-lg bg-surface-container-low py-2 pr-2 pl-4">
            <Link
              href={`/habitos/${h.id}/editar`}
              className="flex min-h-14 min-w-0 flex-1 flex-col justify-center"
            >
              <span className="truncate type-title-medium text-on-surface">{h.nome}</span>
              <span className="flex items-center gap-1.5 type-body-medium text-on-surface-variant">
                {h.areas && <span className="size-2 rounded-full" style={{ backgroundColor: corArea(h.areas.cor) }} aria-hidden />}
                {descreverFrequencia(h)}
                {h.areas && ` · ${h.areas.nome}`}
              </span>
            </Link>
            <Link
              href={`/habitos/${h.id}/editar`}
              className={buttonVariants({ variant: "ghost", size: "icon" })}
              aria-label={`Editar ${h.nome}`}
            >
              <PencilIcon />
            </Link>
            <ConfirmButton
              acao={alternarAtivo.bind(null, h.id, false)}
              confirmar={`Pausar "${h.nome}"? Ele sai do checklist e das taxas; o histórico fica guardado.`}
              variant="ghost"
              size="icon"
              aria-label={`Pausar ${h.nome}`}
            >
              <PauseIcon />
            </ConfirmButton>
            <div className="flex flex-col">
              <ConfirmButton
                acao={moverHabito.bind(null, h.id, "cima")}
                variant="ghost"
                size="icon-xs"
                aria-label={`Mover ${h.nome} para cima`}
                disabled={i === 0}
              >
                <ChevronUpIcon />
              </ConfirmButton>
              <ConfirmButton
                acao={moverHabito.bind(null, h.id, "baixo")}
                variant="ghost"
                size="icon-xs"
                aria-label={`Mover ${h.nome} para baixo`}
                disabled={i === ativos.length - 1}
              >
                <ChevronDownIcon />
              </ConfirmButton>
            </div>
          </li>
        ))}
      </ul>

      {pausados.length > 0 && (
        <section className="mt-12 max-w-2xl">
          <h2 className="mb-3 type-title-small text-on-surface-variant">Pausados ({pausados.length})</h2>
          <ul className="flex flex-col gap-2">
            {pausados.map((h) => (
              <li key={h.id} className="flex items-center gap-2 rounded-lg border border-outline-variant py-2 pr-2 pl-4">
                <Link href={`/habitos/${h.id}/editar`} className="flex min-h-12 min-w-0 flex-1 flex-col justify-center">
                  <span className="truncate type-body-large text-on-surface-variant">{h.nome}</span>
                  <span className="type-body-small text-on-surface-variant">desde {formatarDia(h.inicio)}</span>
                </Link>
                <ConfirmButton
                  acao={alternarAtivo.bind(null, h.id, true)}
                  variant="secondary"
                >
                  <PlayIcon />
                  Retomar
                </ConfirmButton>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
