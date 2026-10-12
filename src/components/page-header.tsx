import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";

export function PageHeader({
  titulo,
  descricao,
  voltar,
  acoes,
  icone,
}: {
  titulo: string;
  descricao?: string | null;
  voltar?: { href: string; nome: string };
  acoes?: React.ReactNode;
  icone?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3">
      {voltar && (
        <Link
          href={voltar.href}
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeftIcon className="size-4" aria-hidden />
          {voltar.nome}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {icone}
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight">{titulo}</h1>
            {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
          </div>
        </div>
        {acoes && <div className="flex flex-wrap items-center gap-2">{acoes}</div>}
      </div>
    </div>
  );
}
