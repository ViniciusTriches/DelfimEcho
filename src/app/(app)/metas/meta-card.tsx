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
    <li className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className={cn("font-medium", !ativa && "text-muted-foreground")}>{meta.titulo}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            {mostrarArea && meta.areas && (
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: meta.areas.cor }} aria-hidden />
                {meta.areas.nome}
              </span>
            )}
            {meta.skills && <span>· {meta.skills.nome}</span>}
          </p>
        </div>
        <Link
          href={`/metas/${meta.id}/editar`}
          className={buttonVariants({ variant: "ghost", size: "icon", className: "size-11 shrink-0 sm:size-8" })}
          aria-label={`Editar ${meta.titulo}`}
        >
          <PencilIcon />
        </Link>
      </div>

      {meta.criterio_de_conclusao && (
        <p className="text-sm">
          <span className="text-muted-foreground">Critério: </span>
          {meta.criterio_de_conclusao}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        {ativa ? (
          <span
            className={cn(
              "flex items-center gap-1.5 text-sm",
              prazo.tom === "atrasada" ? "font-medium text-destructive" : prazo.tom === "proxima" ? "font-medium" : "text-muted-foreground",
            )}
          >
            <IconePrazo
              className={cn("size-4", prazo.tom === "proxima" && "text-[var(--sequencia)]")}
              aria-hidden
            />
            {prazo.texto}
            {meta.prazo && <span className="font-normal text-muted-foreground">· {formatarDia(meta.prazo)}</span>}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {concluida ? (
              <CheckIcon className="size-4 text-[var(--concluido)]" aria-hidden />
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
                confirmar={`Abandonar "${meta.titulo}"? Ela fica no histórico e pode ser reaberta.`}
                variant="ghost"
                className="min-h-11 sm:min-h-8"
              >
                Abandonar
              </ConfirmButton>
              <ConfirmButton
                acao={alterarStatusMeta.bind(null, meta.id, "concluida")}
                confirmar={
                  meta.criterio_de_conclusao
                    ? `Critério: ${meta.criterio_de_conclusao}\n\nMarcar como concluída?`
                    : "Marcar como concluída?"
                }
                className="min-h-11 sm:min-h-8"
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
                  className={buttonVariants({ variant: "outline", className: "min-h-11 sm:min-h-8" })}
                >
                  <MilestoneIcon />
                  Virar marco
                </Link>
              )}
              <ConfirmButton
                acao={alterarStatusMeta.bind(null, meta.id, "ativa")}
                variant="ghost"
                className="min-h-11 sm:min-h-8"
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
