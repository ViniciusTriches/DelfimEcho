import Link from "next/link";
import { formatarDia } from "@/lib/datas";

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
    <div className="flex max-w-2xl flex-col gap-8">
      {anos.map((ano) => (
        <section key={ano} aria-labelledby={`ano-${ano}`}>
          <h3 id={`ano-${ano}`} className="mb-3 text-sm font-semibold text-muted-foreground tabular-nums">
            {ano}
          </h3>
          <ol className="relative flex flex-col gap-5 border-l-2 border-border pl-6">
            {marcos
              .filter((m) => m.data.startsWith(ano))
              .map((m) => (
                <li key={m.id} className="relative">
                  <span
                    className="absolute top-1.5 -left-[calc(1.5rem+7px)] size-3 rounded-full ring-4 ring-background"
                    style={{ backgroundColor: m.areas?.cor ?? "var(--primary)" }}
                    aria-hidden
                  />
                  <Link
                    href={`/marcos/${m.id}/editar`}
                    className="block cursor-pointer rounded-lg py-0.5 transition-colors duration-150 hover:text-primary"
                  >
                    <time dateTime={m.data} className="text-xs text-muted-foreground">
                      {formatarDia(m.data)}
                    </time>
                    <p className="font-medium">{m.titulo}</p>
                  </Link>
                  {(mostrarArea || m.skills) && (
                    <p className="text-sm text-muted-foreground">
                      {[mostrarArea ? m.areas?.nome : null, m.skills?.nome].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {m.descricao && <p className="mt-1 text-sm whitespace-pre-line">{m.descricao}</p>}
                </li>
              ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
