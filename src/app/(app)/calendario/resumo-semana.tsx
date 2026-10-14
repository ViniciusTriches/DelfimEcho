import Link from "next/link";
import { Horas } from "@/components/horas";
import { buttonVariants } from "@/components/ui/button";
import { corArea } from "@/lib/cores-area";
import type { ResumoArea } from "./dados";

/** Plano da semana × horas agendadas em blocos × horas efetivas feitas, por área. */
export function ResumoSemana({ linhas, semana }: { linhas: ResumoArea[]; semana: string }) {
  const total = linhas.reduce(
    (t, l) => ({ plano: t.plano + (l.plano ?? 0), agendado: t.agendado + l.agendado, realizado: t.realizado + l.realizado }),
    { plano: 0, agendado: 0, realizado: 0 },
  );
  return (
    <section aria-labelledby="titulo-resumo" className="rounded-lg bg-surface-container-low p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="titulo-resumo" className="type-title-medium text-on-surface">
          Semana por área
        </h2>
        <Link href={`/plano?semana=${semana}`} className={buttonVariants({ variant: "text", size: "sm" })}>
          Editar plano
        </Link>
      </div>
      {linhas.length === 0 ? (
        <p className="type-body-medium text-on-surface-variant">Sem plano, blocos ou sessões nesta semana.</p>
      ) : (
        <table className="w-full type-body-medium">
          <thead>
            <tr className="text-left type-label-medium text-on-surface-variant">
              <th className="py-1.5 font-medium">Área</th>
              <th className="py-1.5 text-right font-medium">Plano</th>
              <th className="py-1.5 text-right font-medium">Agendado</th>
              <th className="py-1.5 text-right font-medium">Feito</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.areaId} className="border-t border-outline-variant">
                <td className="py-2 pr-2">
                  <span className="flex min-w-0 items-center gap-2 text-on-surface">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: corArea(l.cor) }} aria-hidden />
                    <span className="truncate">{l.nome}</span>
                  </span>
                </td>
                <td className="py-2 pl-2 text-right text-on-surface-variant">{l.plano === null ? "—" : <Horas valor={l.plano} />}</td>
                <td className="py-2 pl-2 text-right text-on-surface">
                  <Horas valor={l.agendado} />
                </td>
                <td className="py-2 pl-2 text-right text-on-surface">
                  <Horas valor={l.realizado} />
                </td>
              </tr>
            ))}
            <tr className="border-t border-outline type-title-small text-on-surface">
              <td className="py-2">Total</td>
              <td className="py-2 text-right">
                <Horas valor={total.plano} />
              </td>
              <td className="py-2 text-right">
                <Horas valor={total.agendado} />
              </td>
              <td className="py-2 text-right">
                <Horas valor={total.realizado} />
              </td>
            </tr>
          </tbody>
        </table>
      )}
      <p className="mt-3 type-body-small text-on-surface-variant">Feito = horas efetivas. Agendado = soma dos blocos planejados.</p>
    </section>
  );
}
