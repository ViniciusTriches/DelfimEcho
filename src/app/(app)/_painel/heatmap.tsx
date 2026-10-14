import { formatarDiaSemana, formatarMesCurto, mesDe } from "@/lib/datas";
import { formatarHoras } from "@/lib/formato";
import type { DiaCalor } from "@/lib/painel";
import { cn } from "@/lib/utils";

// Nível 0 é um tom de superfície (a grade fica num cartão surface-container-low).
const COR_NIVEL = ["var(--md-surface-container-highest)", "var(--viz-calor-1)", "var(--viz-calor-2)", "var(--viz-calor-3)", "var(--viz-calor-4)"];
const LEGENDA = ["Nenhuma", "< 30 min", "< 1h30", "< 3 h", "3 h ou mais"];

function Grade({ colunas, className }: { colunas: DiaCalor[][]; className?: string }) {
  return (
    <div className={className}>
      {/* Meses: rótulo na coluna em que o mês muda */}
      <div className="mb-1.5 grid gap-[3px] type-label-small text-on-surface-variant" style={{ gridTemplateColumns: `repeat(${colunas.length}, minmax(0, 1fr))` }}>
        {colunas.map((c, i) => {
          const mes = mesDe(c[0].dia);
          const mudou = i === 0 || mes !== mesDe(colunas[i - 1][0].dia);
          return (
            <span key={c[0].dia} className="overflow-visible whitespace-nowrap" aria-hidden>
              {mudou && i < colunas.length - 2 ? formatarMesCurto(mes) : ""}
            </span>
          );
        })}
      </div>
      <div
        className="grid grid-flow-col gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${colunas.length}, minmax(0, 1fr))`, gridTemplateRows: "repeat(7, auto)" }}
      >
        {colunas.flat().map((d) => (
          <span
            key={d.dia}
            title={d.futuro ? undefined : `${formatarDiaSemana(d.dia)}: ${d.horas ? `${formatarHoras(d.horas)} efetivas` : "sem prática"}`}
            className={cn("aspect-square rounded-[3px]", d.futuro && "invisible")}
            style={{ backgroundColor: COR_NIVEL[d.nivel] }}
          />
        ))}
      </div>
    </div>
  );
}

/** Dias com prática, estilo GitHub: celular mostra 26 semanas, telas maiores 53. */
export function Heatmap({ colunas }: { colunas: DiaCalor[][] }) {
  const dias = colunas.flat().filter((d) => !d.futuro);
  const comPratica = dias.filter((d) => d.horas > 0);
  const total = comPratica.reduce((t, d) => t + d.horas, 0);

  return (
    <div>
      <Grade colunas={colunas.slice(-26)} className="md:hidden" />
      <Grade colunas={colunas} className="hidden md:block" />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 type-body-small text-on-surface-variant">
        <p>
          <span className="numero text-on-surface">{comPratica.length}</span> {comPratica.length === 1 ? "dia" : "dias"} com prática em 12 meses ·{" "}
          <span className="numero text-on-surface">{formatarHoras(total)}</span> efetivas
        </p>
        <ul className="flex items-center gap-1 type-label-small" aria-label="Legenda: horas efetivas no dia">
          <li aria-hidden>Menos</li>
          {LEGENDA.map((nome, i) => (
            <li key={nome} title={nome} className="size-3 rounded-[3px]" style={{ backgroundColor: COR_NIVEL[i] }}>
              <span className="sr-only">{nome}</span>
            </li>
          ))}
          <li aria-hidden>Mais</li>
        </ul>
      </div>
    </div>
  );
}
