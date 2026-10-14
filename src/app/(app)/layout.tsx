import Link from "next/link";
import { Suspense } from "react";
import { LogOutIcon } from "lucide-react";
import { BarraSuperior } from "@/components/barra-superior";
import { Logo } from "@/components/logo";
import { NavBarra, NavRail } from "@/components/nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { TimerBadge } from "@/components/timer-badge";
import { Button } from "@/components/ui/button";
import { sair } from "./actions";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <NavRail />

      <div className="flex min-h-full flex-1 flex-col pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] md:pl-[calc(6rem+env(safe-area-inset-left))]">
        <BarraSuperior>
          <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-2 px-4 md:px-8">
            <Link href="/" className="rounded-md md:hidden" aria-label="Echo, início">
              <Logo />
            </Link>
            <div className="ml-auto flex items-center gap-1">
              <Suspense fallback={null}>
                <TimerBadge />
              </Suspense>
              <ThemeToggle />
              <form action={sair}>
                <Button variant="ghost" size="icon" type="submit" aria-label="Sair" title="Sair">
                  <LogOutIcon />
                </Button>
              </form>
            </div>
          </div>
        </BarraSuperior>

        {/* pb: espaço para a navigation bar (80px) + FAB no celular */}
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-2 pb-40 md:px-8 md:pb-16">
          <Suspense fallback={<p className="type-body-medium text-on-surface-variant">Carregando…</p>}>
            {children}
          </Suspense>
        </main>
      </div>

      <NavBarra />
    </>
  );
}
