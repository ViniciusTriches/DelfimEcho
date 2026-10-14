"use client";

import { useOptimistic, useState, useTransition } from "react";
import * as m from "motion/react-m";
import { CheckAnimado } from "@/components/check-animado";
import { EcoAneis } from "@/components/eco";
import { CheckIcon, ChevronDownIcon, FlameIcon } from "lucide-react";
import { Progresso } from "@/components/ui/progresso";
import { toast } from "sonner";
import { NOMES_DIAS } from "@/lib/habitos";
import { cn } from "@/lib/utils";
import { corArea } from "@/lib/cores-area";
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

  const previstos = itens.filter((i) => i.previsto);
  const outros = itens.filter((i) => !i.previsto);
  const feitosPrevistos = previstos.filter((i) => feitos.has(i.id)).length;

  // Conta as vezes em que o usuário completou o dia (cada uma dispara o eco).
  const [completou, setCompletou] = useState(0);
  const [tocados, setTocados] = useState<Set<string>>(() => new Set());

  function marcar(item: ItemChecklist) {
    const feito = !feitos.has(item.id);
    setTocados((t) => new Set(t).add(item.id));
    if (feito && item.previsto && feitosPrevistos === previstos.length - 1) setCompletou((c) => c + 1);
    startTransition(async () => {
      alternar(item.id);
      const r = await marcarHabito(item.id, dia, feito);
      if (r?.erro) toast.error(r.erro);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {previstos.length > 0 && (
        <div>
          <div className="mb-2 flex items-baseline justify-between type-body-medium">
            <span className="text-on-surface-variant">
              <span className="numero text-on-surface">
                {feitosPrevistos}/{previstos.length}
              </span>{" "}
              feitos
            </span>
            {feitosPrevistos === previstos.length && (
              <m.span
                key={completou}
                className="flex items-center gap-1.5 type-label-large text-on-surface"
                initial={completou ? { opacity: 0, scale: 0.8 } : false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 24 }}
              >
                <span className="relative flex size-4 items-center justify-center text-concluido">
                  {completou > 0 && <EcoAneis cor="var(--concluido)" escala={3.4} />}
                  <CheckIcon className="size-4" aria-hidden />
                </span>
                Dia completo
              </m.span>
            )}
          </div>
          <Progresso
            fracao={feitosPrevistos / previstos.length}
            rotulo={`${feitosPrevistos} de ${previstos.length} hábitos feitos`}
            corPreenchimento="bg-concluido"
            corTrilho="bg-surface-container-highest"
          />
        </div>
      )}

      <Lista itens={previstos} feitos={feitos} tocados={tocados} marcar={marcar} />

      {outros.length > 0 && (
        <details className="group">
          <summary className="camada-estado flex min-h-10 w-fit cursor-pointer list-none items-center gap-1 rounded-full px-3 type-label-large text-on-surface-variant [&::-webkit-details-marker]:hidden">
            <ChevronDownIcon className="size-4 transition-transform duration-200 group-open:rotate-180" aria-hidden />
            Não previstos neste dia ({outros.length})
          </summary>
          <div className="mt-2">
            <Lista itens={outros} feitos={feitos} tocados={tocados} marcar={marcar} />
          </div>
        </details>
      )}
    </div>
  );
}

function Lista({
  itens,
  feitos,
  tocados,
  marcar,
}: {
  itens: ItemChecklist[];
  feitos: Set<string>;
  /** Marcados nesta visita: só eles animam (os que vieram marcados aparecem prontos). */
  tocados: Set<string>;
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
                "camada-estado flex min-h-16 w-full cursor-pointer items-center gap-4 rounded-lg bg-surface-container-low px-4 py-2 text-left text-on-surface",
              )}
            >
              <m.span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150",
                  feito ? "border-concluido bg-concluido text-surface" : "border-outline",
                )}
                initial={false}
                animate={{ scale: feito ? [1, 1.18, 1] : 1 }}
                transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
                aria-hidden
              >
                {feito && <CheckAnimado className="size-4" animar={tocados.has(item.id)} />}
              </m.span>

              <span className="min-w-0 flex-1">
                <span className={cn("block truncate type-body-large", feito && "text-on-surface-variant line-through decoration-on-surface-variant/50")}>
                  {item.nome}
                </span>
                <span className="mt-1 flex items-center gap-2 type-body-small text-on-surface-variant">
                  {item.cor && <span className="size-2 rounded-full" style={{ backgroundColor: corArea(item.cor) }} aria-hidden />}
                  {item.frequencia}
                  <Semana dias={item.semana} />
                </span>
              </span>

              {item.sequencia > 0 && (
                <span
                  className="flex shrink-0 items-center gap-1 type-label-large text-on-surface"
                  aria-label={`Sequência de ${item.sequencia} ${item.sequencia === 1 ? "dia" : "dias"}`}
                  title={`Sequência de ${item.sequencia} ${item.sequencia === 1 ? "dia" : "dias"}`}
                >
                  <FlameIcon className="size-4 text-sequencia" aria-hidden />
                  <span className="numero">{item.sequencia}</span>
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
              ? "bg-concluido"
              : d.previsto && !d.futuro
                ? "border border-outline"
                : "bg-surface-container-highest",
          )}
        />
      ))}
    </span>
  );
}
