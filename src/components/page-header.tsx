import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

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
    <div className="mb-8 flex flex-col gap-2">
      {voltar && (
        <Link
          href={voltar.href}
          className={buttonVariants({ variant: "text", size: "sm", className: "-ml-3 w-fit pl-2 has-[>svg:first-child]:pl-2" })}
        >
          <ChevronLeftIcon aria-hidden />
          {voltar.nome}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 items-center gap-4">
          {icone}
          <div className="min-w-0">
            <h1 className="type-headline-small text-on-surface md:type-headline-medium">{titulo}</h1>
            {descricao && <p className="mt-1 type-body-medium text-on-surface-variant first-letter:uppercase">{descricao}</p>}
          </div>
        </div>
        {acoes && <div className="flex flex-wrap items-center gap-2">{acoes}</div>}
      </div>
    </div>
  );
}
