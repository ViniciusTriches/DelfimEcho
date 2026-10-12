import Link from "next/link";
import { Suspense } from "react";
import { LogOutIcon } from "lucide-react";
import { Logo } from "@/components/logo";
import { NavRodape, NavTopo } from "@/components/nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { sair } from "./actions";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
          <Link href="/">
            <Logo />
          </Link>
          <NavTopo />
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <form action={sair}>
              <Button variant="ghost" type="submit">
                <LogOutIcon />
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-24 md:pb-10">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}>
          {children}
        </Suspense>
      </main>

      <NavRodape />
    </>
  );
}
