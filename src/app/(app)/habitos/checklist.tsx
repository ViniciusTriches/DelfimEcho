"use client";

import { useOptimistic, useTransition } from "react";
import { CheckIcon, FlameIcon } from "lucide-react";
import { toast } from "sonner";
import { NOMES_DIAS } from "@/lib/habitos";
import { cn } from "@/lib/utils";
import { marcarHabito } from "./actions";

export type DiaSemana = { dia: string; previsto: boolean; feito: boolean; futuro: boolean };

export type ItemChecklist = {
  id: string;
  nome: string;
  cor: string | null;
  frequencia: string;
  previsto: boolean;
  feito: boolean;
  sequencia: number;
  semana: DiaSemana[];
};

export function Checklist({ dia, itens }: { dia: string; itens: ItemChecklist[] }) {
  const [, startTransition] = useTransition();
  const [feitos, alternar] = useOptimistic(
    new Set(itens.filter((i) => i.feito).map((i) => i.id)),
    (atual: Set<string>, id: string) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    },
  );

  function marcar(item: ItemChecklist) {
    const feito = !feitos.has(item.id);
    startTransition(async () => {
      alternar(item.id);
      const r = await marcarHabito(item.id, dia, feito);
      if (r?.erro) toast.error(r.erro);
    });
  }

  const previstos = itens.filter((i) => i.previsto);
  const outros = itens.filter((i) => !i.previsto);
  const feitosPrevistos = previstos.filter((i) => feitos.has(i.id)).length;

  return (
    <div className="flex flex-col gap-4">
      {previstos.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">
              <strong className="text-foreground tabular-nums">
                {feitosPrevistos} de {previstos.length}
              </strong>{" "}
              feitos
            </span>
            {feitosPrevistos === previstos.length && (
              <span className="flex items-center gap-1 font-medium">
                <CheckIcon className="size-4 text-[var(--concluido)]" aria-hidden />
                Dia completo
              </span>
            )}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[var(--concluido)] transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${(feitosPrevistos / previstos.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <Lista itens={previstos} feitos={feitos} marcar={marcar} />

      {outros.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-muted-foreground">
            Não previstos neste dia ({outros.length})
          </summary>
          <div className="mt-2">
            <Lista itens={outros} feitos={feitos} marcar={marcar} />
          </div>
        </details>
      )}
    </div>
  );
}

function Lista({
  itens,
  feitos,
  marcar,
}: {
  itens: ItemChecklist[];
  feitos: Set<string>;
  marcar: (item: ItemChecklist) => void;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {itens.map((item) => {
        const feito = feitos.has(item.id);
        return (
          <li key={item.id}>
            <button
              type="button"
              role="checkbox"
              aria-checked={feito}
              onClick={() => marcar(item)}
              className={cn(
                "flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl border bg-card px-3 py-2 text-left transition-colors duration-150 hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                feito && "border-[var(--concluido)]/40",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150",
                  feito ? "border-[var(--concluido)] bg-[var(--concluido)] text-white" : "border-muted-foreground/40",
                )}
                aria-hidden
              >
                {feito && <CheckIcon className="size-4" strokeWidth={3} />}
              </span>

              <span className="min-w-0 flex-1">
                <span className={cn("block truncate font-medium", feito && "text-muted-foreground line-through")}>
                  {item.nome}
                </span>
                <span className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  {item.cor && <span className="size-2 rounded-full" style={{ backgroundColor: item.cor }} aria-hidden />}
                  {item.frequencia}
                  <Semana dias={item.semana} />
                </span>
              </span>

              {item.sequencia > 0 && (
                <span
                  className="flex shrink-0 items-center gap-1 text-sm font-medium tabular-nums"
                  aria-label={`Sequência de ${item.sequencia} ${item.sequencia === 1 ? "dia" : "dias"}`}
                  title={`Sequência de ${item.sequencia} ${item.sequencia === 1 ? "dia" : "dias"}`}
                >
                  <FlameIcon className="size-4 text-[var(--sequencia)]" aria-hidden />
                  {item.sequencia}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Mini semana (seg a dom): cheio = feito, contorno = previsto, ponto fraco = não previsto. */
function Semana({ dias }: { dias: DiaSemana[] }) {
  const resumo = dias
    .map((d, i) => ({ ...d, nome: NOMES_DIAS[i] }))
    .filter((d) => d.previsto && !d.futuro)
    .map((d) => `${d.nome}: ${d.feito ? "feito" : "não feito"}`);
  return (
    <span className="hidden items-center gap-1 sm:flex" title={resumo.join(", ")}>
      {dias.map((d) => (
        <span
          key={d.dia}
          aria-hidden
          className={cn(
            "size-2 rounded-full",
            d.feito
              ? "bg-[var(--concluido)]"
              : d.previsto && !d.futuro
                ? "border border-muted-foreground/50"
                : "bg-muted",
          )}
        />
      ))}
    </span>
  );
}
