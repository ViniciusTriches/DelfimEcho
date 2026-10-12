import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { FiltroAreas } from "@/components/filtro-areas";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { STATUS_META, type StatusMeta } from "@/lib/metas";
import { carregarOpcoes, parametroUuid } from "@/lib/opcoes";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { MetaCard } from "./meta-card";

export const metadata: Metadata = { title: "Metas" };

export default async function MetasPage({ searchParams }: PageProps<"/metas">) {
  const params = await searchParams;
  const area = parametroUuid(params.area);
  const status: StatusMeta = STATUS_META.some((s) => s.valor === params.status)
    ? (params.status as StatusMeta)
    : "ativa";

  const supabase = await createClient();
  let consulta = supabase
    .from("goals")
    .select("*, areas(nome, cor), skills(nome)")
    .order("prazo", { ascending: true, nullsFirst: false })
    .order("criado_em");
  if (area) consulta = consulta.eq("area_id", area);
  const [{ data: metas }, { areas }] = await Promise.all([consulta, carregarOpcoes()]);

  const contagem = Object.fromEntries(
    STATUS_META.map((s) => [s.valor, metas?.filter((m) => m.status === s.valor).length ?? 0]),
  );
  let lista = metas?.filter((m) => m.status === status) ?? [];
  // Concluídas e abandonadas: mais recentes primeiro.
  if (status !== "ativa") lista = [...lista].reverse();
  if (status === "concluida") lista.sort((a, b) => (b.concluida_em ?? "").localeCompare(a.concluida_em ?? ""));

  const link = (p: { area?: string | null; status?: StatusMeta }) => {
    const q = new URLSearchParams();
    const a = p.area === undefined ? area : p.area;
    const s = p.status ?? status;
    if (a) q.set("area", a);
    if (s !== "ativa") q.set("status", s);
    const str = q.toString();
    return str ? `/metas?${str}` : "/metas";
  };

  return (
    <>
      <PageHeader
        titulo="Metas"
        descricao="Metas de resultado, com prazo e critério de conclusão."
        acoes={
          <Link href={area ? `/metas/nova?area=${area}` : "/metas/nova"} className={buttonVariants()}>
            <PlusIcon />
            Nova meta
          </Link>
        }
      />

      <FiltroAreas areas={areas} atual={area} href={(a) => link({ area: a })} />

      <nav aria-label="Status" className="mb-5 flex gap-1 border-b">
        {STATUS_META.map((s) => (
          <Link
            key={s.valor}
            href={link({ status: s.valor })}
            scroll={false}
            aria-current={status === s.valor ? "page" : undefined}
            className={cn(
              "-mb-px inline-flex min-h-11 cursor-pointer items-center gap-1.5 border-b-2 px-3 text-sm transition-colors duration-150",
              status === s.valor
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {s.nome}
            <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums">{contagem[s.valor]}</span>
          </Link>
        ))}
      </nav>

      {lista.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {status === "ativa" ? "Nenhuma meta ativa." : status === "concluida" ? "Nenhuma meta concluída ainda." : "Nenhuma meta abandonada."}
        </p>
      ) : (
        <ul className="flex max-w-3xl flex-col gap-3">
          {lista.map((m) => (
            <MetaCard key={m.id} meta={m} />
          ))}
        </ul>
      )}
    </>
  );
}
