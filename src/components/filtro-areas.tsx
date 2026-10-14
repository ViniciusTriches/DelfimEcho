import Link from "next/link";
import { ChipCheck, chipVariants } from "@/components/ui/chip";
import { corArea } from "@/lib/cores-area";

/** Chips de filtro por área (links, então funciona com voltar/compartilhar). */
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
    <nav aria-label="Filtrar por área" className="mb-6 flex flex-wrap gap-2">
      {[{ id: null, nome: "Todas", cor: null }, ...areas].map((a) => {
        const selecionado = atual === a.id;
        return (
          <Link
            key={a.id ?? "todas"}
            href={href(a.id)}
            scroll={false}
            aria-current={selecionado ? "true" : undefined}
            className={chipVariants({ selecionado })}
          >
            <ChipCheck visivel={selecionado} />
            {a.cor && !selecionado && (
              <span className="size-2 rounded-full" style={{ backgroundColor: corArea(a.cor) }} aria-hidden />
            )}
            {a.nome}
          </Link>
        );
      })}
    </nav>
  );
}
