import Link from "next/link";
import { cn } from "@/lib/utils";

/** Chips para filtrar uma lista por área (links, então funciona com voltar/compartilhar). */
export function FiltroAreas({
  areas,
  atual,
  href,
}: {
  areas: { id: string; nome: string; cor: string }[];
  atual: string | null;
  href: (areaId: string | null) => string;
}) {
  if (areas.length < 2) return null;
  return (
    <nav aria-label="Filtrar por área" className="mb-5 flex flex-wrap gap-2">
      {[{ id: null, nome: "Todas", cor: null }, ...areas].map((a) => (
        <Link
          key={a.id ?? "todas"}
          href={href(a.id)}
          scroll={false}
          aria-current={atual === a.id ? "true" : undefined}
          className={cn(
            "inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-sm transition-colors duration-150",
            atual === a.id ? "border-primary bg-primary/10 font-medium" : "hover:bg-muted",
          )}
        >
          {a.cor && <span className="size-2 rounded-full" style={{ backgroundColor: a.cor }} aria-hidden />}
          {a.nome}
        </Link>
      ))}
    </nav>
  );
}
