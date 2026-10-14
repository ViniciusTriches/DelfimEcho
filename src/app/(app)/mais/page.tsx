import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { MAIS } from "@/lib/navegacao";

export const metadata: Metadata = { title: "Mais" };

export default function MaisPage() {
  return (
    <>
      <PageHeader titulo="Mais" />
      <ul className="flex max-w-xl flex-col overflow-hidden rounded-lg bg-surface-container-low">
        {MAIS.map((item, i) => (
          <li key={item.href} className={i > 0 ? "border-t border-outline-variant" : undefined}>
            <Link
              href={item.href}
              className="camada-estado flex min-h-18 cursor-pointer items-center gap-4 px-4 py-3 text-on-surface"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                <item.icone className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block type-title-medium">{item.nome}</span>
                {item.descricao && <span className="block type-body-medium text-on-surface-variant">{item.descricao}</span>}
              </span>
              <ChevronRightIcon className="size-5 text-on-surface-variant" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
