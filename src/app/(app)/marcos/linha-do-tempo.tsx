import Link from "next/link";
import { formatarDia } from "@/lib/datas";
import { corArea } from "@/lib/cores-area";

export type MarcoComArea = {
  id: string;
  titulo: string;
  descricao: string | null;
  data: string;
  areas: { nome: string; cor: string } | null;
  skills: { nome: string } | null;
};

/** Linha do tempo vertical, mais recentes primeiro, agrupada por ano. */
export function LinhaDoTempo({ marcos, mostrarArea = true }: { marcos: MarcoComArea[]; mostrarArea?: boolean }) {
  const anos = [...new Set(marcos.map((m) => m.data.slice(0, 4)))];
  return (
    <div className="flex max-w-2xl flex-col gap-10">
      {anos.map((ano) => (
        <section key={ano} aria-labelledby={`ano-${ano}`}>
          <h3 id={`ano-${ano}`} className="numero mb-4 type-title-medium text-on-surface-variant">
            {ano}
          </h3>
          <ol className="relative flex flex-col gap-3 pl-8 before:absolute before:top-2 before:bottom-2 before:left-[0.4375rem] before:w-0.5 before:rounded-full before:bg-outline-variant">
            {marcos
              .filter((m) => m.data.startsWith(ano))
              .map((m) => {
                const contexto = [mostrarArea ? m.areas?.nome : null, m.skills?.nome].filter(Boolean).join(" · ");
                return (
                  <li key={m.id} className="relative">
                    <span
                      className="absolute top-5 -left-8 size-4 rounded-full ring-4 ring-surface"
                      style={{ backgroundColor: corArea(m.areas?.cor) }}
                      aria-hidden
                    />
                    <Link
                      href={`/marcos/${m.id}/editar`}
                      className="camada-estado flex flex-col gap-1 rounded-lg bg-surface-container-low px-4 py-3"
                    >
                      <time dateTime={m.data} className="type-label-medium text-on-surface-variant">
                        {formatarDia(m.data)}
                      </time>
                      <span className="type-title-medium text-on-surface">{m.titulo}</span>
                      {contexto && <span className="type-body-medium text-on-surface-variant">{contexto}</span>}
                      {m.descricao && (
                        <span className="mt-1 type-body-medium whitespace-pre-line text-on-surface">{m.descricao}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
          </ol>
        </section>
      ))}
    </div>
  );
}
