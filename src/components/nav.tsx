"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Menu } from "@base-ui/react/menu";
import { EllipsisIcon } from "lucide-react";
import { Logo } from "@/components/logo";
import { fabVariants } from "@/components/ui/fab";
import { type ItemNav, itemAtivo, MAIS, maisAtivo, PRINCIPAIS, REGISTRAR } from "@/lib/navegacao";
import { cn } from "@/lib/utils";

// Navegação Material 3: navigation rail no PC (md+), navigation bar + FAB no celular.
// A rota atual só existe em tempo de execução: o fallback (sem destaque) entra no HTML
// pré-renderizado e o destaque do item ativo aparece em seguida.

type Rota = { pathname: string | null };

function useRota(): Rota {
  return { pathname: usePathname() };
}

const ativo = (r: Rota, item: ItemNav) => (r.pathname ? itemAtivo(r.pathname, item) : false);
const ativoMais = (r: Rota) => (r.pathname ? maisAtivo(r.pathname) : false);

/** Destino com indicador em pílula (ícone) e rótulo embaixo — igual no rail e na barra. */
function Destino({
  item,
  selecionado,
  largura,
}: {
  item: ItemNav;
  selecionado: boolean;
  largura: "rail" | "barra";
}) {
  return (
    <Link
      href={item.href}
      aria-current={selecionado ? "page" : undefined}
      className={cn(
        "group flex cursor-pointer flex-col items-center gap-1 outline-none",
        largura === "barra" ? "min-h-16 flex-1 justify-center pt-3 pb-4" : "w-20 py-1",
      )}
    >
      <Indicador selecionado={selecionado} icone={item.icone} />
      <span
        className={cn(
          "type-label-medium transition-colors duration-150",
          selecionado ? "font-semibold text-on-surface" : "text-on-surface-variant",
        )}
      >
        {item.nome}
      </span>
    </Link>
  );
}

function Indicador({ selecionado, icone: Icone }: { selecionado: boolean; icone: ItemNav["icone"] }) {
  return (
    <span
      className={cn(
        "camada-estado flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-200 ease-standard",
        "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary",
        selecionado ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant",
      )}
    >
      <Icone className="size-6" strokeWidth={selecionado ? 2.25 : 1.75} aria-hidden />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Rail (PC)
// ---------------------------------------------------------------------------

function Rail({ rota }: { rota: Rota }) {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-y-0 left-0 z-20 hidden w-24 flex-col items-center gap-3 bg-surface pt-5 pb-6 md:flex"
    >
      <Link href="/" aria-label="Echo, início" className="mb-2 rounded-md p-1">
        <Logo somenteMarca />
      </Link>
      <Link
        href={REGISTRAR.href}
        aria-label={REGISTRAR.nome}
        title={REGISTRAR.nome}
        className={cn(fabVariants({ tamanho: "icone" }), "mb-5 shadow-elev-1")}
      >
        <REGISTRAR.icone aria-hidden />
      </Link>
      <ul className="flex flex-col items-center gap-3">
        {PRINCIPAIS.map((item) => (
          <li key={item.href}>
            <Destino item={item} selecionado={ativo(rota, item)} largura="rail" />
          </li>
        ))}
        <li>
          <Menu.Root>
            <Menu.Trigger
              className="group flex w-20 cursor-pointer flex-col items-center gap-1 py-1 outline-none"
              aria-label="Mais destinos"
            >
              <Indicador selecionado={ativoMais(rota)} icone={EllipsisIcon} />
              <span
                className={cn(
                  "type-label-medium",
                  ativoMais(rota) ? "font-semibold text-on-surface" : "text-on-surface-variant",
                )}
              >
                Mais
              </span>
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner side="right" align="start" sideOffset={4} className="z-50">
                <Menu.Popup className="min-w-60 origin-(--transform-origin) rounded-md bg-surface-container py-2 text-on-surface shadow-elev-2 outline-none data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity duration-150">
                  {MAIS.map((item) => (
                    <Menu.LinkItem
                      key={item.href}
                      render={<Link href={item.href} />}
                      className={cn(
                        "flex min-h-12 cursor-pointer items-center gap-3 px-4 type-label-large outline-none data-highlighted:bg-on-surface/8",
                        ativo(rota, item) && "bg-secondary-container text-on-secondary-container",
                      )}
                    >
                      <item.icone className="size-5 text-on-surface-variant" aria-hidden />
                      {item.nome}
                    </Menu.LinkItem>
                  ))}
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </li>
      </ul>
    </nav>
  );
}

function RailAtivo() {
  return <Rail rota={useRota()} />;
}

export function NavRail() {
  return (
    <Suspense fallback={<Rail rota={{ pathname: null }} />}>
      <RailAtivo />
    </Suspense>
  );
}

// ---------------------------------------------------------------------------
// Navigation bar + FAB (celular)
// ---------------------------------------------------------------------------

function Barra({ rota }: { rota: Rota }) {
  const mais: ItemNav = { href: "/mais", nome: "Mais", icone: EllipsisIcon };
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-20 bg-surface-container pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex max-w-lg">
        {PRINCIPAIS.map((item) => (
          <li key={item.href} className="flex flex-1">
            <Destino item={item} selecionado={ativo(rota, item)} largura="barra" />
          </li>
        ))}
        <li className="flex flex-1">
          <Destino item={mais} selecionado={ativoMais(rota)} largura="barra" />
        </li>
      </ul>
    </nav>
  );
}

function Fab({ rota }: { rota: Rota }) {
  // Na tela de registro e no timer o FAB sairia do contexto.
  if (rota.pathname && itemAtivo(rota.pathname, REGISTRAR)) return null;
  return (
    <Link
      href={REGISTRAR.href}
      className={cn(
        fabVariants({ tamanho: "estendido" }),
        "fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-20 md:hidden",
      )}
    >
      <REGISTRAR.icone aria-hidden />
      Registrar
    </Link>
  );
}

function BarraAtiva() {
  const rota = useRota();
  return (
    <>
      <Fab rota={rota} />
      <Barra rota={rota} />
    </>
  );
}

export function NavBarra() {
  return (
    <Suspense fallback={<Barra rota={{ pathname: null }} />}>
      <BarraAtiva />
    </Suspense>
  );
}
