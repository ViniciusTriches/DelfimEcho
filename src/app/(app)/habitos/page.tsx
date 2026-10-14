import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, FlameIcon, PlusIcon, Settings2Icon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { formatarDiaSemana, hojeSP, inicioSemana, mesDe, somarDias } from "@/lib/datas";
import { melhorSequencia, sequenciaAtual, somarTaxas, type Taxa, taxa } from "@/lib/habitos";
import { cn } from "@/lib/utils";
import { CalendarioHabitos } from "./calendario";
import { Checklist } from "./checklist";
import { carregarHabitos, montarChecklist } from "./dados";

export const metadata: Metadata = { title: "Hábitos" };

const DIA = /^\d{4}-\d{2}-\d{2}$/;
const MES = /^\d{4}-\d{2}$/;
const PCT = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0 });

export default async function HabitosPage({ searchParams }: PageProps<"/habitos">) {
  const params = await searchParams;
  const hoje = hojeSP();
  const dia = typeof params.dia === "string" && DIA.test(params.dia) && params.dia <= hoje ? params.dia : hoje;
  const mes = typeof params.mes === "string" && MES.test(params.mes) && params.mes <= mesDe(hoje) ? params.mes : mesDe(hoje);
  const filtro = typeof params.habito === "string" ? params.habito : null;

  const carregados = await carregarHabitos();
  const { habitos, feitos } = carregados;

  if (!habitos.length) {
    return (
      <>
        <PageHeader titulo="Hábitos" />
        <div className="flex max-w-xl flex-col items-start gap-4 rounded-xl border p-5">
          <p className="text-muted-foreground">Nenhum hábito ativo. Crie o primeiro para começar o checklist diário.</p>
          <Link href="/habitos/novo" className={buttonVariants()}>
            <PlusIcon />
            Novo hábito
          </Link>
        </div>
      </>
    );
  }

  const itens = montarChecklist(carregados, dia, hoje);

  // Cumprimento: semana e mês atuais (hoje só conta se já foi feito).
  const inicioMes = `${mesDe(hoje)}-01`;
  const estatisticas = habitos.map((h) => {
    const f = feitos.get(h.id)!;
    return {
      id: h.id,
      nome: h.nome,
      semana: taxa(h, f, inicioSemana(hoje), hoje, hoje),
      mes: taxa(h, f, inicioMes, hoje, hoje),
      sequencia: sequenciaAtual(h, f, hoje),
      melhor: melhorSequencia(h, f, hoje),
    };
  });
  const geralSemana = somarTaxas(estatisticas.map((e) => e.semana));
  const geralMes = somarTaxas(estatisticas.map((e) => e.mes));

  const link = (p: { dia?: string; mes?: string; habito?: string | null }) => {
    const q = new URLSearchParams();
    const d = p.dia ?? dia;
    const m = p.mes ?? mes;
    const hab = p.habito === undefined ? filtro : p.habito;
    if (d !== hoje) q.set("dia", d);
    if (m !== mesDe(hoje)) q.set("mes", m);
    if (hab) q.set("habito", hab);
    const s = q.toString();
    return s ? `/habitos?${s}` : "/habitos";
  };

  const rotuloDia = dia === hoje ? "Hoje" : dia === somarDias(hoje, -1) ? "Ontem" : formatarDiaSemana(dia);

  return (
    <>
      <PageHeader
        titulo="Hábitos"
        acoes={
          <>
            <Link href="/habitos/gerenciar" className={buttonVariants({ variant: "outline" })}>
              <Settings2Icon />
              Gerenciar
            </Link>
            <Link href="/habitos/novo" className={buttonVariants()}>
              <PlusIcon />
              Novo hábito
            </Link>
          </>
        }
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <section aria-labelledby="titulo-checklist">
          <div className="mb-3 flex items-center justify-between gap-2">
            <Link
              href={link({ dia: somarDias(dia, -1) })}
              scroll={false}
              className="flex size-11 items-center justify-center rounded-lg hover:bg-muted"
              aria-label="Dia anterior"
            >
              <ChevronLeftIcon className="size-5" />
            </Link>
            <div className="text-center">
              <h2 id="titulo-checklist" className="text-lg font-semibold">
                {rotuloDia}
              </h2>
              {dia !== hoje && (
                <p className="text-xs text-muted-foreground first-letter:uppercase">{formatarDiaSemana(dia)}</p>
              )}
            </div>
            {dia < hoje ? (
              <Link
                href={link({ dia: somarDias(dia, 1) })}
                scroll={false}
                className="flex size-11 items-center justify-center rounded-lg hover:bg-muted"
                aria-label="Próximo dia"
              >
                <ChevronRightIcon className="size-5" />
              </Link>
            ) : (
              <span className="size-11" />
            )}
          </div>
          <Checklist key={dia} dia={dia} itens={itens} />
        </section>

        <section aria-labelledby="titulo-cumprimento">
          <h2 id="titulo-cumprimento" className="mb-3 text-lg font-semibold">
            Cumprimento
          </h2>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <Resumo rotulo="Esta semana" t={geralSemana} />
            <Resumo rotulo="Este mês" t={geralMes} />
          </div>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-normal">Hábito</th>
                  <th className="px-2 py-2 text-right font-normal">Semana</th>
                  <th className="px-2 py-2 text-right font-normal">Mês</th>
                  <th className="px-3 py-2 text-right font-normal">
                    <span className="sr-only">Sequência atual e melhor</span>
                    <FlameIcon className="ml-auto size-3.5" aria-hidden />
                  </th>
                </tr>
              </thead>
              <tbody>
                {estatisticas.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="max-w-40 truncate px-3 py-2">{e.nome}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{pct(e.semana)}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{pct(e.mes)}</td>
                    <td className="px-3 py-2 text-right tabular-nums" title={`Atual ${e.sequencia} · melhor ${e.melhor}`}>
                      {e.sequencia}
                      <span className="text-muted-foreground"> / {e.melhor}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Sequência: atual / melhor. Só contam os dias previstos desde o início de cada hábito; hoje entra quando
            for feito.
          </p>
        </section>
      </div>

      <section aria-labelledby="titulo-calendario" className="mt-10">
        <h2 id="titulo-calendario" className="mb-3 text-lg font-semibold">
          Histórico
        </h2>
        <CalendarioHabitos
          mes={mes}
          hoje={hoje}
          habitos={habitos}
          feitos={feitos}
          filtro={filtro && habitos.some((h) => h.id === filtro) ? filtro : null}
          href={link}
        />
      </section>
    </>
  );
}

function pct(t: Taxa) {
  return t.fracao === null ? "—" : PCT.format(t.fracao);
}

function Resumo({ rotulo, t }: { rotulo: string; t: Taxa }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <p className="text-xs text-muted-foreground">{rotulo}</p>
      <p className={cn("mt-1 text-2xl font-semibold", t.fracao === null && "text-muted-foreground")}>{pct(t)}</p>
      <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
        {t.previstos ? `${t.feitos} de ${t.previstos} previstos` : "Nada previsto ainda"}
      </p>
    </div>
  );
}
