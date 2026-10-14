import { Bloco } from "@/components/esqueleto";

/** Esqueleto do calendário: barra de ferramentas + grade de horários. */
export default function Carregando() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="flex flex-col gap-4">
      <span className="sr-only">Carregando calendário…</span>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Bloco className="h-9 w-48" />
          <Bloco className="h-10 w-36 rounded-full" />
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Bloco className="h-10 flex-1 rounded-full sm:w-64 sm:flex-none" />
          <Bloco className="h-10 w-28 rounded-full" />
        </div>
      </div>
      <div className="grid h-[calc(100dvh-15rem)] min-h-80 grid-cols-[3.5rem_1fr] gap-px overflow-hidden rounded-lg bg-surface-container-low p-2 md:h-[calc(100dvh-13rem)] md:grid-cols-[3.5rem_repeat(7,1fr)]">
        <span />
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className={i ? "hidden flex-col gap-2 p-1 md:flex" : "flex flex-col gap-2 p-1"}>
            <Bloco className="mx-auto h-8 w-8 rounded-full" />
            <Bloco className={i % 2 ? "mt-16 h-20" : "mt-6 h-14"} />
            <Bloco className={i % 3 ? "mt-10 h-12" : "mt-24 h-24"} />
          </div>
        ))}
      </div>
    </div>
  );
}
