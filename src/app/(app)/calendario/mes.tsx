import Link from "next/link";
import { CalendarClockIcon, FlagIcon, MilestoneIcon } from "lucide-react";
import { Horas } from "@/components/horas";
import { NOMES_DIA_CURTO } from "@/lib/calendario";
import { cn } from "@/lib/utils";
import type { DiaMes } from "./calendario";

// Intensidade: a mesma rampa de um tom do heatmap (horas efetivas do dia). O 1º tom leva o
// anel do tom seguinte para não sumir na superfície (regra do design system).
const COR_NIVEL = ["transparent", "var(--viz-calor-1)", "var(--viz-calor-2)", "var(--viz-calor-3)", "var(--viz-calor-4)"];

/** Grade do mês: horas feitas (com intensidade) e marcadores de blocos, prazos e marcos. */
export function Mes({ dias, mes, hoje, hrefDia }: { dias: DiaMes[]; mes: string; hoje: string; hrefDia: (dia: string) => string }) {
  return (
    <div className="overflow-hidden rounded-lg bg-surface-container-low">
      <div className="grid grid-cols-7 border-b border-outline-variant">
        {NOMES_DIA_CURTO.map((n) => (
          <span key={n} className="py-2 text-center type-label-medium text-on-surface-variant">
            {n}
          </span>
        ))}
      </div>
      <ol className="grid grid-cols-7">
        {dias.map((d, i) => {
          const foraDoMes = !d.dia.startsWith(mes);
          const eHoje = d.dia === hoje;
          const rotulo = [
            `${Number(d.dia.slice(8, 10))}/${d.dia.slice(5, 7)}`,
            d.horas > 0 ? `${d.horas.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} h efetivas` : "sem prática",
            d.blocos ? `${d.blocos} ${d.blocos === 1 ? "bloco planejado" : "blocos planejados"}` : null,
            d.metas ? `${d.metas} ${d.metas === 1 ? "prazo de meta" : "prazos de metas"}` : null,
            d.marcos ? `${d.marcos} ${d.marcos === 1 ? "marco" : "marcos"}` : null,
          ]
            .filter(Boolean)
            .join(", ");
          return (
            <li key={d.dia} className={cn("min-w-0 border-outline-variant", i % 7 && "border-l", i >= 7 && "border-t")}>
              <Link
                href={hrefDia(d.dia)}
                aria-label={rotulo}
                className={cn(
                  "camada-estado flex h-full min-h-20 flex-col gap-1 p-1.5 sm:min-h-28 sm:p-2",
                  foraDoMes && "bg-surface-container text-on-surface-variant",
                )}
              >
                <span
                  className={cn(
                    "numero flex size-7 items-center justify-center rounded-full type-label-large",
                    eHoje ? "bg-primary text-on-primary" : foraDoMes ? "text-on-surface-variant" : "text-on-surface",
                  )}
                >
                  {Number(d.dia.slice(8, 10))}
                </span>
                {d.horas > 0 && (
                  <span className="hidden truncate type-label-medium text-on-surface sm:block">
                    <Horas valor={d.horas} />
                  </span>
                )}
                <span className="mt-auto flex flex-wrap items-center gap-x-1.5 gap-y-0.5 type-label-medium text-on-surface-variant" aria-hidden>
                  {d.blocos > 0 && (
                    <span className="flex items-center gap-0.5">
                      <CalendarClockIcon className="size-3.5" />
                      <span className="numero hidden sm:inline">{d.blocos}</span>
                    </span>
                  )}
                  {d.metas > 0 && <FlagIcon className="size-3.5 text-tertiary" />}
                  {d.marcos > 0 && <MilestoneIcon className="size-3.5" />}
                </span>
                {d.nivel > 0 && (
                  <span
                    className="h-1.5 w-full rounded-full"
                    style={{
                      backgroundColor: COR_NIVEL[d.nivel],
                      boxShadow: d.nivel === 1 ? "inset 0 0 0 1px var(--viz-calor-2)" : undefined,
                    }}
                    aria-hidden
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-outline-variant px-3 py-2 type-label-medium text-on-surface-variant">
        <span className="flex items-center gap-1">
          <CalendarClockIcon className="size-3.5" aria-hidden /> Blocos planejados
        </span>
        <span className="flex items-center gap-1">
          <FlagIcon className="size-3.5 text-tertiary" aria-hidden /> Prazo de meta
        </span>
        <span className="flex items-center gap-1">
          <MilestoneIcon className="size-3.5" aria-hidden /> Marco
        </span>
        <span className="flex items-center gap-1">
          <span className="flex gap-0.5" aria-hidden>
            {COR_NIVEL.slice(1).map((c, i) => (
              <span
                key={c}
                className="h-1.5 w-3 rounded-full"
                style={{ backgroundColor: c, boxShadow: i === 0 ? "inset 0 0 0 1px var(--viz-calor-2)" : undefined }}
              />
            ))}
          </span>
          Horas feitas no dia
        </span>
      </div>
    </div>
  );
}
