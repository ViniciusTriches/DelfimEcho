import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDaysIcon, CalendarRangeIcon, ChevronRightIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { formatarDiaMes, formatarMesAno } from "@/lib/datas";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Revisões" };

const FILTROS = [
  { valor: null, nome: "Todas" },
  { valor: "semanal", nome: "Semanais" },
  { valor: "mensal", nome: "Mensais" },
] as const;

export default async function RevisoesPage({ searchParams }: PageProps<"/revisoes">) {
  const tipoParam = (await searchParams).tipo;
  const tipo = tipoParam === "semanal" || tipoParam === "mensal" ? tipoParam : null;

  const supabase = await createClient();
  let consulta = supabase.from("reviews").select("*").order("periodo_inicio", { ascending: false }).order("tipo");
  if (tipo) consulta = consulta.eq("tipo", tipo);
  const { data: revisoes } = await consulta;

  return (
    <>
      <PageHeader
        titulo="Revisões"
        descricao="O que funcionou, onde travou e o que vem a seguir."
        voltar={{ href: "/mais", nome: "Mais" }}
        acoes={
          <>
            <Link href="/revisoes/semanal" className={buttonVariants()}>
              <CalendarRangeIcon />
              Revisar semana
            </Link>
            <Link href="/revisoes/mensal" className={buttonVariants({ variant: "outline" })}>
              <CalendarDaysIcon />
              Revisar mês
            </Link>
          </>
        }
      />

      <nav aria-label="Tipo" className="mb-5 flex gap-1 border-b">
        {FILTROS.map((f) => (
          <Link
            key={f.nome}
            href={f.valor ? `/revisoes?tipo=${f.valor}` : "/revisoes"}
            scroll={false}
            aria-current={tipo === f.valor ? "page" : undefined}
            className={cn(
              "-mb-px inline-flex min-h-11 cursor-pointer items-center border-b-2 px-3 text-sm transition-colors duration-150",
              tipo === f.valor
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {f.nome}
          </Link>
        ))}
      </nav>

      {!revisoes?.length ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma revisão ainda. A primeira leva poucos minutos: o resumo da semana já vem pronto.
        </p>
      ) : (
        <ul className="flex max-w-3xl flex-col gap-2">
          {revisoes.map((r) => {
            const semanal = r.tipo === "semanal";
            const href = semanal
              ? `/revisoes/semanal?semana=${r.periodo_inicio}`
              : `/revisoes/mensal?mes=${r.periodo_inicio.slice(0, 7)}`;
            return (
              <li key={r.id}>
                <Link
                  href={href}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-4 transition-colors duration-150 hover:bg-muted/50"
                >
                  {semanal ? (
                    <CalendarRangeIcon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                  ) : (
                    <CalendarDaysIcon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium first-letter:uppercase">
                      {semanal
                        ? `Semana de ${formatarDiaMes(r.periodo_inicio)} a ${formatarDiaMes(r.periodo_fim)}`
                        : formatarMesAno(r.periodo_inicio)}
                    </p>
                    {r.prioridades_proximo_periodo && (
                      <p className="truncate text-sm text-muted-foreground">
                        Prioridades: {r.prioridades_proximo_periodo}
                      </p>
                    )}
                  </div>
                  {r.nota_geral && (
                    <span className="shrink-0 text-sm tabular-nums" aria-label={`Nota ${r.nota_geral} de 5`}>
                      <strong>{r.nota_geral}</strong>
                      <span className="text-muted-foreground">/5</span>
                    </span>
                  )}
                  <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
