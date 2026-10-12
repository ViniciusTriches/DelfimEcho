"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { HomeIcon, LayersIcon, ListChecksIcon, type LucideIcon, PlusCircleIcon, SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// `tambem`: outras rotas que destacam o item (ex.: habilidades ficam em "Áreas").
const ITENS: { href: string; nome: string; icone: LucideIcon; tambem?: string[] }[] = [
  { href: "/", nome: "Início", icone: HomeIcon },
  { href: "/registrar", nome: "Registrar", icone: PlusCircleIcon, tambem: ["/timer"] },
  { href: "/habitos", nome: "Hábitos", icone: ListChecksIcon },
  { href: "/areas", nome: "Áreas", icone: LayersIcon, tambem: ["/habilidades"] },
  { href: "/configuracoes", nome: "Ajustes", icone: SettingsIcon },
];

type Ativo = (href: string) => boolean;
const nenhumAtivo: Ativo = () => false;

function useAtivo(): Ativo {
  const pathname = usePathname();
  return (href) => {
    if (href === "/") return pathname === "/";
    const item = ITENS.find((i) => i.href === href);
    return [href, ...(item?.tambem ?? [])].some((p) => pathname.startsWith(p));
  };
}

function LinksTopo({ ativo }: { ativo: Ativo }) {
  return (
    <nav className="hidden flex-1 items-center gap-1 text-sm md:flex">
      {ITENS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground",
            ativo(item.href) && "bg-muted font-medium text-foreground",
          )}
        >
          {item.nome}
        </Link>
      ))}
    </nav>
  );
}

function LinksRodape({ ativo }: { ativo: Ativo }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-md">
        {ITENS.map((item) => (
          <li key={item.href} className="flex-1">
            <Link
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 text-xs text-muted-foreground",
                ativo(item.href) && "font-medium text-primary",
              )}
            >
              <item.icone className="size-5" aria-hidden />
              {item.nome}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function LinksTopoAtivos() {
  return <LinksTopo ativo={useAtivo()} />;
}

function LinksRodapeAtivos() {
  return <LinksRodape ativo={useAtivo()} />;
}

// A rota atual só existe em tempo de execução: o fallback (sem destaque) entra no HTML
// pré-renderizado e o destaque do item ativo aparece em seguida.

/** Links no cabeçalho (telas médias e grandes). */
export function NavTopo() {
  return (
    <Suspense fallback={<LinksTopo ativo={nenhumAtivo} />}>
      <LinksTopoAtivos />
    </Suspense>
  );
}

/** Barra fixa no rodapé (celular). */
export function NavRodape() {
  return (
    <Suspense fallback={<LinksRodape ativo={nenhumAtivo} />}>
      <LinksRodapeAtivos />
    </Suspense>
  );
}
