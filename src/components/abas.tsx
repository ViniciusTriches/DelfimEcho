import Link from "next/link";
import { cn } from "@/lib/utils";

export type Aba = { href: string; nome: string; ativa: boolean; contagem?: number };

/** Abas primárias M3 (cada aba é um link; o filtro vive na URL). */
export function Abas({ rotulo, abas }: { rotulo: string; abas: Aba[] }) {
  return (
    <nav aria-label={rotulo} className="mb-6 flex overflow-x-auto border-b border-outline-variant">
      {abas.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          scroll={false}
          aria-current={a.ativa ? "page" : undefined}
          className={cn(
            "camada-estado relative inline-flex min-h-12 shrink-0 items-center justify-center gap-2 px-4 type-title-small sm:min-w-28",
            a.ativa ? "text-primary" : "text-on-surface-variant",
          )}
        >
          {a.nome}
          {a.contagem !== undefined && (
            <span
              className={cn(
                "numero min-w-5 rounded-full px-1.5 text-center type-label-small",
                a.ativa ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant",
              )}
            >
              {a.contagem}
            </span>
          )}
          {a.ativa && (
            <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-primary" aria-hidden />
          )}
        </Link>
      ))}
    </nav>
  );
}
