"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Menu } from "@base-ui/react/menu";
import { ChevronDownIcon, EllipsisIcon } from "lucide-react";
import { type ItemNav as Item, MAIS, PRINCIPAIS } from "@/lib/navegacao";
import { cn } from "@/lib/utils";

const comeca = (pathname: string, item: Item) =>
  [item.href, ...(item.tambem ?? [])].some((p) => (p === "/" ? pathname === "/" : pathname.startsWith(p)));

function useRota() {
  const pathname = usePathname();
  return {
    ativo: (item: Item) => comeca(pathname, item),
    maisAtivo: pathname.startsWith("/mais") || MAIS.some((i) => comeca(pathname, i)),
  };
}

type Rota = ReturnType<typeof useRota>;
const nenhuma: Rota = { ativo: () => false, maisAtivo: false };

function LinksTopo({ rota }: { rota: Rota }) {
  const classe = (ativo: boolean) =>
    cn(
      "inline-flex cursor-pointer items-center gap-1 rounded-md px-3 py-1.5 text-muted-foreground transition-colors duration-150 hover:text-foreground",
      ativo && "bg-muted font-medium text-foreground",
    );
  return (
    <nav className="hidden flex-1 items-center gap-1 text-sm md:flex">
      {PRINCIPAIS.map((item) => (
        <Link key={item.href} href={item.href} className={classe(rota.ativo(item))}>
          {item.nome}
        </Link>
      ))}
      <Menu.Root>
        <Menu.Trigger className={classe(rota.maisAtivo)}>
          Mais
          <ChevronDownIcon className="size-3.5" aria-hidden />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={6} align="start" className="z-50">
            <Menu.Popup className="min-w-56 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md outline-none">
              {MAIS.map((item) => (
                <Menu.LinkItem
                  key={item.href}
                  render={<Link href={item.href} />}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none data-highlighted:bg-muted",
                    rota.ativo(item) && "font-medium",
                  )}
                >
                  <item.icone className="size-4 text-muted-foreground" aria-hidden />
                  {item.nome}
                </Menu.LinkItem>
              ))}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </nav>
  );
}

function LinksRodape({ rota }: { rota: Rota }) {
  const itens = [...PRINCIPAIS, { href: "/mais", nome: "Mais", icone: EllipsisIcon }];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-md">
        {itens.map((item) => {
          const ativo = item.href === "/mais" ? rota.maisAtivo : rota.ativo(item);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground",
                  ativo && "font-medium text-primary",
                )}
              >
                <item.icone className="size-5" aria-hidden />
                {item.nome}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function LinksTopoAtivos() {
  return <LinksTopo rota={useRota()} />;
}

function LinksRodapeAtivos() {
  return <LinksRodape rota={useRota()} />;
}

// A rota atual só existe em tempo de execução: o fallback (sem destaque) entra no HTML
// pré-renderizado e o destaque do item ativo aparece em seguida.

/** Links no cabeçalho (telas médias e grandes). */
export function NavTopo() {
  return (
    <Suspense fallback={<LinksTopo rota={nenhuma} />}>
      <LinksTopoAtivos />
    </Suspense>
  );
}

/** Barra fixa no rodapé (celular). */
export function NavRodape() {
  return (
    <Suspense fallback={<LinksRodape rota={nenhuma} />}>
      <LinksRodapeAtivos />
    </Suspense>
  );
}
