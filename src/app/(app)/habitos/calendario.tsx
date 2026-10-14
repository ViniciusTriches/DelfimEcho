import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { formatarDia, formatarMesAno, mesDe, somarDias, somarMeses } from "@/lib/datas";
import { diaDaSemana, type HabitoRegra, NOMES_DIAS, previsto } from "@/lib/habitos";
import { buttonVariants } from "@/components/ui/button";
import { ChipCheck, chipVariants } from "@/components/ui/chip";
import { cn } from "@/lib/utils";

type Habito = HabitoRegra & { id: string; nome: string };

type Estado = { previstos: number; feitos: number; pendenteHoje: boolean; futuro: boolean };

function estadoDoDia(habitos: Habito[], feitos: Map<string, Set<string>>, dia: string, hoje: string): Estado {
  if (dia > hoje) return { previstos: 0, feitos: 0, pendenteHoje: false, futuro: true };
  let previstos = 0;
  let feitosNoDia = 0;
  for (const h of habitos) {
    if (!previsto(h, dia)) continue;
    previstos++;
    if (feitos.get(h.id)?.has(dia)) feitosNoDia++;
  }
  return { previstos, feitos: feitosNoDia, pendenteHoje: dia === hoje && feitosNoDia < previstos, futuro: false };
}

/** Intensidade do marcador: proporção feita (0 → só contorno). */
function Marcador({ e, unico }: { e: Estado; unico: boolean }) {
  if (e.futuro || e.previstos === 0) return <span className="size-3" aria-hidden />;
  const fracao = e.feitos / e.previstos;
  if (fracao === 0) {
    return (
      <span
        aria-hidden
        className={cn(
          "size-3 rounded-full border-2",
          e.pendenteHoje ? "border-dashed border-outline" : "border-outline",
        )}
      />
    );
  }
  const pct = unico || fracao === 1 ? 100 : fracao >= 0.5 ? 65 : 35;
  return (
    <span
      aria-hidden
      className="size-3 rounded-full"
      style={{ backgroundColor: `color-mix(in oklab, var(--concluido) ${pct}%, transparent)` }}
    />
  );
}

export function CalendarioHabitos({
  mes,
  hoje,
  habitos,
  feitos,
  filtro,
  href,
}: {
  mes: string; // "AAAA-MM"
  hoje: string;
  habitos: Habito[];
  feitos: Map<string, Set<string>>;
  filtro: string | null;
  href: (params: { mes?: string; habito?: string | null }) => string;
}) {
  const doFiltro = filtro ? habitos.filter((h) => h.id === filtro) : habitos;
  const unico = doFiltro.length === 1;
  const primeiro = `${mes}-01`;
  const dias: string[] = [];
  for (let d = primeiro; mesDe(d) === mes; d = somarDias(d, 1)) dias.push(d);
  const vazios = diaDaSemana(primeiro) - 1;
  const proximo = somarMeses(mes, 1);

  return (
    <div className="flex flex-col gap-4">
      {/* Filtro por hábito */}
      <div className="flex flex-wrap gap-2">
        {[{ id: null, nome: "Todos" }, ...habitos].map((h) => (
          <Link
            key={h.id ?? "todos"}
            href={href({ mes, habito: h.id })}
            scroll={false}
            aria-current={filtro === h.id ? "true" : undefined}
            className={chipVariants({ selecionado: filtro === h.id })}
          >
            <ChipCheck visivel={filtro === h.id} />
            {h.nome}
          </Link>
        ))}
      </div>

      <div className="max-w-md rounded-lg bg-surface-container-low p-4">
        <div className="mb-2 flex items-center justify-between">
          <Link
            href={href({ mes: somarMeses(mes, -1), habito: filtro })}
            scroll={false}
            className={buttonVariants({ variant: "ghost", size: "icon" })}
            aria-label="Mês anterior"
          >
            <ChevronLeftIcon className="size-5" />
          </Link>
          <p className="type-title-medium text-on-surface first-letter:uppercase">{formatarMesAno(primeiro)}</p>
          {proximo <= mesDe(hoje) ? (
            <Link
              href={href({ mes: proximo, habito: filtro })}
              scroll={false}
              className={buttonVariants({ variant: "ghost", size: "icon" })}
              aria-label="Próximo mês"
            >
              <ChevronRightIcon className="size-5" />
            </Link>
          ) : (
            <span className="size-10" />
          )}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {NOMES_DIAS.map((n) => (
            <span key={n} className="pb-1 type-label-medium text-on-surface-variant">
              {n}
            </span>
          ))}
          {Array.from({ length: vazios }, (_, i) => (
            <span key={`v${i}`} />
          ))}
          {dias.map((dia) => {
            const e = estadoDoDia(doFiltro, feitos, dia, hoje);
            const descricao = e.futuro
              ? ""
              : e.previstos === 0
                ? "nada previsto"
                : unico
                  ? e.feitos
                    ? "feito"
                    : e.pendenteHoje
                      ? "pendente"
                      : "não feito"
                  : `${e.feitos} de ${e.previstos} feitos`;
            return (
              <div
                key={dia}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center gap-1 rounded-lg",
                  dia === hoje && "ring-2 ring-primary ring-inset",
                )}
                title={descricao ? `${formatarDia(dia)}: ${descricao}` : undefined}
              >
                <span className={cn("numero type-body-small", e.futuro ? "text-on-surface-variant/60" : "text-on-surface")}>
                  {Number(dia.slice(8))}
                </span>
                <Marcador e={e} unico={unico} />
                {descricao && <span className="sr-only">{`${formatarDia(dia)}: ${descricao}`}</span>}
              </div>
            );
          })}
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 type-body-small text-on-surface-variant">
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-concluido" aria-hidden />
            {unico ? "Feito" : "Todos feitos"}
          </li>
          {!unico && (
            <li className="flex items-center gap-1.5">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: "color-mix(in oklab, var(--concluido) 35%, transparent)" }}
                aria-hidden
              />
              Parte feita (mais forte = mais feitos)
            </li>
          )}
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-full border-2 border-outline" aria-hidden />
            Nenhum feito
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-full border-2 border-dashed border-outline" aria-hidden />
            Hoje, pendente
          </li>
        </ul>
      </div>
    </div>
  );
}
