import { formatarDiaSemana, formatarMesCurto, mesDe } from "@/lib/datas";
import { Horas } from "@/components/horas";
import { formatarHoras } from "@/lib/formato";
import type { DiaCalor } from "@/lib/painel";
import { cn } from "@/lib/utils";

// Nível 0 é um tom de superfície (a grade fica num cartão surface-container-low).
const COR_NIVEL = ["var(--md-surface-container-highest)", "var(--viz-calor-1)", "var(--viz-calor-2)", "var(--viz-calor-3)", "var(--viz-calor-4)"];
const LEGENDA = ["Nenhuma", "< 30 min", "< 1h30", "< 3 h", "3 h ou mais"];
// O 1º tom fica abaixo de 3:1 contra a superfície e perto do tom dos dias vazios:
// ganha um anel interno no tom seguinte da rampa (calor-2: acima de 3:1 nos dois temas,
// sem parecer mais intenso que os níveis de cima).
const ANEL_NIVEL_1 = "inset 0 0 0 1px var(--viz-calor-2)";
const estiloCelula = (nivel: number) => ({
  backgroundColor: COR_NIVEL[nivel],
  boxShadow: nivel === 1 ? ANEL_NIVEL_1 : undefined,
});

function Grade({ colunas, className, resumo }: { colunas: DiaCalor[][]; className?: string; resumo: string }) {
  return (
    <div className={className} role="img" aria-label={resumo}>
      {/* Meses: rótulo na coluna em que o mês muda */}
      <div className="mb-1.5 grid gap-[3px] type-label-medium text-on-surface-variant" style={{ gridTemplateColumns: `repeat(${colunas.length}, minmax(0, 1fr))` }}>
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
            aria-hidden
            className={cn("aspect-square rounded-[3px]", d.futuro && "invisible")}
            style={estiloCelula(d.nivel)}
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
  const resumo = `Dias com prática: ${comPratica.length} em 12 meses, ${formatarHoras(total)} efetivas.`;

  return (
    <div>
      <Grade colunas={colunas.slice(-26)} className="md:hidden" resumo={resumo} />
      <Grade colunas={colunas} className="hidden md:block" resumo={resumo} />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 type-body-small text-on-surface-variant">
        <p>
          <span className="numero text-on-surface">{comPratica.length}</span> {comPratica.length === 1 ? "dia" : "dias"} com prática em 12 meses ·{" "}
          <Horas valor={total} className="text-on-surface" /> efetivas
        </p>
        <ul className="flex items-center gap-1 type-label-medium" aria-label="Legenda: horas efetivas no dia">
          <li aria-hidden>Menos</li>
          {LEGENDA.map((nome, i) => (
            <li key={nome} title={nome} className="size-3 rounded-[3px]" style={estiloCelula(i)}>
              <span className="sr-only">{nome}</span>
            </li>
          ))}
          <li aria-hidden>Mais</li>
        </ul>
      </div>
    </div>
  );
}
