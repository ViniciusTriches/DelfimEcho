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
    <div className="mb-8 flex items-center justify-between gap-2 rounded-full bg-surface-container-low p-1">
      <Link href={anterior} className="camada-estado flex size-11 items-center justify-center rounded-full text-on-surface-variant" aria-label="Período anterior">
        <ChevronLeftIcon className="size-5" />
      </Link>
      <div className="text-center">
        <p className="type-title-medium text-on-surface first-letter:uppercase">{rotulo}</p>
        {detalhe && <p className="type-body-small text-on-surface-variant">{detalhe}</p>}
      </div>
      {seguinte ? (
        <Link href={seguinte} className="camada-estado flex size-11 items-center justify-center rounded-full text-on-surface-variant" aria-label="Próximo período">
          <ChevronRightIcon className="size-5" />
        </Link>
      ) : (
        <span className="size-11" />
      )}
    </div>
  );
}
