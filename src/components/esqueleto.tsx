import { cn } from "@/lib/utils";

/**
 * Esqueletos de carregamento (Material 3, tons de superfície). Aparecem na hora ao trocar de
 * tela (loading.tsx) enquanto os dados chegam. Pulso suave, desligado com movimento reduzido.
 */
export function Bloco({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("block animate-pulse rounded-md bg-surface-container-high motion-reduce:animate-none", className)}
    />
  );
}

type Variante = "painel" | "lista" | "cartoes" | "formulario" | "detalhe" | "checklist";

/** Esqueleto de página: título real (já sabido) + blocos no formato da tela. */
export function EsqueletoPagina({
  titulo,
  variante = "lista",
  voltar = false,
}: {
  titulo?: string;
  variante?: Variante;
  voltar?: boolean;
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Carregando{titulo ? ` ${titulo}` : ""}…</span>
      <div className="mb-8 flex flex-col gap-2">
        {voltar && <Bloco className="h-8 w-24 rounded-full" />}
        {titulo ? (
          <h1 className="type-headline-small text-on-surface md:type-headline-medium">{titulo}</h1>
        ) : (
          <Bloco className="h-9 w-48" />
        )}
        <Bloco className="mt-1 h-4 w-56" />
      </div>
      {variante === "painel" && <Painel />}
      {variante === "lista" && <Lista />}
      {variante === "cartoes" && <Cartoes />}
      {variante === "formulario" && <Formulario />}
      {variante === "detalhe" && <Detalhe />}
      {variante === "checklist" && <Checklist />}
    </div>
  );
}

function Painel() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Bloco className="h-14 rounded-lg sm:flex-1" />
        <Bloco className="h-14 rounded-lg sm:w-48" />
      </div>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-4 lg:order-2">
          <Bloco className="h-6 w-40" />
          {[0, 1, 2, 3].map((i) => (
            <Bloco key={i} className="h-14 rounded-lg" />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <Bloco className="h-6 w-32" />
          <Bloco className="h-12 w-40" />
          {[0, 1, 2].map((i) => (
            <Bloco key={i} className="h-8" />
          ))}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Bloco key={i} className="h-36 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Lista() {
  return (
    <div className="flex max-w-3xl flex-col gap-2">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Bloco key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  );
}

function Cartoes() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Bloco key={i} className="h-40 rounded-lg" />
      ))}
    </div>
  );
}

function Formulario() {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <Bloco className="h-4 w-28" />
          <Bloco className="h-12" />
        </div>
      ))}
      <Bloco className="h-10 w-36 rounded-full" />
    </div>
  );
}

function Detalhe() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Bloco key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Bloco className="h-6 w-48" />
      <Bloco className="h-56 rounded-lg" />
      <Bloco className="h-6 w-40" />
      <Lista />
    </div>
  );
}

function Checklist() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="flex flex-col gap-3">
        <Bloco className="h-11 w-full rounded-full" />
        <Bloco className="h-2 w-full" />
        {[0, 1, 2, 3, 4].map((i) => (
          <Bloco key={i} className="h-14 rounded-lg" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Bloco className="h-24 rounded-lg" />
          <Bloco className="h-24 rounded-lg" />
        </div>
        <Bloco className="h-56 rounded-lg" />
      </div>
    </div>
  );
}
