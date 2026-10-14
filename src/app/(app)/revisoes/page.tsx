import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDaysIcon, CalendarRangeIcon, ChevronRightIcon } from "lucide-react";
import { Abas } from "@/components/abas";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { formatarDiaMes, formatarMesAno } from "@/lib/datas";
import { createClient } from "@/lib/supabase/server";


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
            <Link href="/revisoes/mensal" className={buttonVariants({ variant: "secondary" })}>
              <CalendarDaysIcon />
              Revisar mês
            </Link>
          </>
        }
      />

      <Abas
        rotulo="Tipo"
        abas={FILTROS.map((f) => ({
          href: f.valor ? `/revisoes?tipo=${f.valor}` : "/revisoes",
          nome: f.nome,
          ativa: tipo === f.valor,
        }))}
      />

      {!revisoes?.length ? (
        <p className="max-w-3xl rounded-lg bg-surface-container-low p-6 type-body-large text-on-surface-variant">
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
                  className="camada-estado flex min-h-18 items-center gap-4 rounded-lg bg-surface-container-low px-4 py-3"
                >
                  {semanal ? (
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"><CalendarRangeIcon className="size-5" aria-hidden /></span>
                  ) : (
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-tertiary-container text-on-tertiary-container"><CalendarDaysIcon className="size-5" aria-hidden /></span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="type-title-medium text-on-surface first-letter:uppercase">
                      {semanal
                        ? `Semana de ${formatarDiaMes(r.periodo_inicio)} a ${formatarDiaMes(r.periodo_fim)}`
                        : formatarMesAno(r.periodo_inicio)}
                    </p>
                    {r.prioridades_proximo_periodo && (
                      <p className="truncate type-body-medium text-on-surface-variant">
                        Prioridades: {r.prioridades_proximo_periodo}
                      </p>
                    )}
                  </div>
                  {r.nota_geral && (
                    <span className="numero shrink-0 type-title-medium text-on-surface" aria-label={`Nota ${r.nota_geral} de 5`}>
                      {r.nota_geral}
                      <span className="text-on-surface-variant">/5</span>
                    </span>
                  )}
                  <ChevronRightIcon className="size-4 shrink-0 text-on-surface-variant" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
