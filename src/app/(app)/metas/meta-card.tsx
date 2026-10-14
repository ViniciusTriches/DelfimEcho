import Link from "next/link";
import {
  AlertTriangleIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  MilestoneIcon,
  PencilIcon,
  RotateCcwIcon,
  XIcon,
} from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { buttonVariants } from "@/components/ui/button";
import { formatarDia, hojeSP } from "@/lib/datas";
import { descreverPrazo } from "@/lib/metas";
import { cn } from "@/lib/utils";
import { corArea } from "@/lib/cores-area";
import { alterarStatusMeta } from "./actions";

export type MetaComArea = {
  id: string;
  titulo: string;
  status: string;
  prazo: string | null;
  criterio_de_conclusao: string | null;
  concluida_em: string | null;
  area_id: string;
  skill_id: string | null;
  areas: { nome: string; cor: string } | null;
  skills: { nome: string } | null;
};

export function MetaCard({ meta, mostrarArea = true }: { meta: MetaComArea; mostrarArea?: boolean }) {
  const hoje = hojeSP();
  const prazo = descreverPrazo(meta.prazo, hoje);
  const IconePrazo = prazo.tom === "atrasada" ? AlertTriangleIcon : prazo.tom === "proxima" ? ClockIcon : CalendarIcon;
  const ativa = meta.status === "ativa";
  const concluida = meta.status === "concluida";

  const novoMarco = new URLSearchParams({
    titulo: meta.titulo,
    area: meta.area_id,
    ...(meta.skill_id ? { habilidade: meta.skill_id } : {}),
    ...(meta.concluida_em ? { data: meta.concluida_em.slice(0, 10) } : {}),
  });

  return (
    <li className="flex flex-col gap-4 rounded-lg bg-surface-container-low p-5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className={cn("type-title-medium", ativa ? "text-on-surface" : "text-on-surface-variant")}>{meta.titulo}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 type-body-medium text-on-surface-variant">
            {mostrarArea && meta.areas && (
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: corArea(meta.areas.cor) }} aria-hidden />
                {meta.areas.nome}
              </span>
            )}
            {meta.skills && <span>· {meta.skills.nome}</span>}
          </p>
        </div>
        <Link
          href={`/metas/${meta.id}/editar`}
          className={buttonVariants({ variant: "ghost", size: "icon", className: "-mt-2 -mr-2 shrink-0 text-on-surface-variant" })}
          aria-label={`Editar ${meta.titulo}`}
        >
          <PencilIcon />
        </Link>
      </div>

      {meta.criterio_de_conclusao && (
        <p className="rounded-md bg-surface-container px-3 py-2 type-body-medium text-on-surface">
          <span className="type-label-medium text-on-surface-variant">Critério · </span>
          {meta.criterio_de_conclusao}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        {ativa ? (
          <span
            className={cn(
              "flex items-center gap-1.5 type-body-medium",
              prazo.tom === "atrasada" ? "font-medium text-error" : prazo.tom === "proxima" ? "font-medium text-on-surface" : "text-on-surface-variant",
            )}
          >
            <IconePrazo
              className={cn("size-4", prazo.tom === "proxima" && "text-sequencia")}
              aria-hidden
            />
            {prazo.texto}
            {meta.prazo && <span className="font-normal text-on-surface-variant">· {formatarDia(meta.prazo)}</span>}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 type-body-medium text-on-surface-variant">
            {concluida ? (
              <CheckIcon className="size-4 text-concluido" aria-hidden />
            ) : (
              <XIcon className="size-4" aria-hidden />
            )}
            {concluida
              ? `Concluída${meta.concluida_em ? ` em ${formatarDia(meta.concluida_em.slice(0, 10))}` : ""}`
              : "Abandonada"}
          </span>
        )}

        <div className="flex flex-wrap gap-2">
          {ativa ? (
            <>
              <ConfirmButton
                acao={alterarStatusMeta.bind(null, meta.id, "abandonada")}
                confirmar={`Abandonar "${meta.titulo}"?\n\nEla fica no histórico e pode ser reaberta.`}
                variant="text"
              >
                Abandonar
              </ConfirmButton>
              <ConfirmButton
                acao={alterarStatusMeta.bind(null, meta.id, "concluida")}
                comemorar={`Meta concluída: ${meta.titulo}`}
                confirmar={
                  meta.criterio_de_conclusao
                    ? `Marcar como concluída?\n\nCritério: ${meta.criterio_de_conclusao}`
                    : "Marcar como concluída?"
                }
              >
                <CheckIcon />
                Concluir
              </ConfirmButton>
            </>
          ) : (
            <>
              {concluida && (
                <Link
                  href={`/marcos/novo?${novoMarco}`}
                  className={buttonVariants({ variant: "secondary" })}
                >
                  <MilestoneIcon />
                  Virar marco
                </Link>
              )}
              <ConfirmButton
                acao={alterarStatusMeta.bind(null, meta.id, "ativa")}
                variant="text"
              >
                <RotateCcwIcon />
                Reabrir
              </ConfirmButton>
            </>
          )}
        </div>
      </div>
    </li>
  );
}
