import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

/** Setas de período anterior/seguinte (a seguinte some quando chegaria no futuro). */
export function NavegacaoPeriodo({
  rotulo,
  anterior,
  seguinte,
  detalhe,
}: {
  rotulo: string;
  anterior: string;
  seguinte: string | null;
  detalhe?: string;
}) {
  return (
    <div className="mb-8 flex items-center justify-between gap-2 rounded-xl border bg-card p-1">
      <Link href={anterior} className="flex size-11 items-center justify-center rounded-lg hover:bg-muted" aria-label="Período anterior">
        <ChevronLeftIcon className="size-5" />
      </Link>
      <div className="text-center">
        <p className="font-medium first-letter:uppercase">{rotulo}</p>
        {detalhe && <p className="text-xs text-muted-foreground">{detalhe}</p>}
      </div>
      {seguinte ? (
        <Link href={seguinte} className="flex size-11 items-center justify-center rounded-lg hover:bg-muted" aria-label="Próximo período">
          <ChevronRightIcon className="size-5" />
        </Link>
      ) : (
        <span className="size-11" />
      )}
    </div>
  );
}
