import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { MAIS } from "@/lib/navegacao";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Mais" };

export default function MaisPage() {
  return (
    <>
      <PageHeader titulo="Mais" />
      <ul className="flex max-w-xl flex-col divide-y rounded-xl border bg-card">
        {MAIS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex min-h-16 cursor-pointer items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-muted/60"
            >
              <item.icone className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{item.nome}</span>
                {item.descricao && <span className="block text-sm text-muted-foreground">{item.descricao}</span>}
              </span>
              <ChevronRightIcon className="size-4 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
