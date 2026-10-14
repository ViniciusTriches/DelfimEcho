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
        <div className="flex max-w-xl flex-col items-start gap-4 rounded-lg bg-surface-container-low p-5">
          <p className="text-on-surface-variant">Nenhum hábito ativo. Crie o primeiro para começar o checklist diário.</p>
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

      <div className="grid gap-x-10 gap-y-12 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <section aria-labelledby="titulo-checklist">
          <div className="mb-4 flex items-center justify-between gap-2 rounded-full bg-surface-container-low p-1">
            <Link
              href={link({ dia: somarDias(dia, -1) })}
              scroll={false}
              className={buttonVariants({ variant: "ghost", size: "icon" })}
              aria-label="Dia anterior"
            >
              <ChevronLeftIcon className="size-5" />
            </Link>
            <div className="text-center">
              <h2 id="titulo-checklist" className="type-title-medium text-on-surface">
                {rotuloDia}
              </h2>
              {dia !== hoje && (
                <p className="type-body-small text-on-surface-variant first-letter:uppercase">{formatarDiaSemana(dia)}</p>
              )}
            </div>
            {dia < hoje ? (
              <Link
                href={link({ dia: somarDias(dia, 1) })}
                scroll={false}
                className={buttonVariants({ variant: "ghost", size: "icon" })}
                aria-label="Próximo dia"
              >
                <ChevronRightIcon className="size-5" />
              </Link>
            ) : (
              <span className="size-10" />
            )}
          </div>
          <Checklist key={dia} dia={dia} itens={itens} />
        </section>

        <section aria-labelledby="titulo-cumprimento">
          <h2 id="titulo-cumprimento" className="mb-4 type-title-large text-on-surface">
            Cumprimento
          </h2>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <Resumo rotulo="Esta semana" t={geralSemana} />
            <Resumo rotulo="Este mês" t={geralMes} />
          </div>
          <div className="overflow-x-auto rounded-lg bg-surface-container-low">
            <table className="w-full type-body-medium">
              <thead>
                <tr className="text-left type-label-medium text-on-surface-variant">
                  <th className="px-4 py-3 font-medium">Hábito</th>
                  <th className="px-2 py-3 text-right font-medium">Semana</th>
                  <th className="px-2 py-3 text-right font-medium">Mês</th>
                  <th className="px-4 py-3 text-right font-medium">
                    <span className="sr-only">Sequência atual e melhor</span>
                    <FlameIcon className="ml-auto size-3.5" aria-hidden />
                  </th>
                </tr>
              </thead>
              <tbody>
                {estatisticas.map((e) => (
                  <tr key={e.id} className="border-t border-outline-variant">
                    <td className="max-w-40 truncate px-4 py-3">{e.nome}</td>
                    <td className="numero px-2 py-3 text-right">{pct(e.semana)}</td>
                    <td className="numero px-2 py-3 text-right">{pct(e.mes)}</td>
                    <td className="numero px-4 py-3 text-right" title={`Atual ${e.sequencia} · melhor ${e.melhor}`}>
                      {e.sequencia}
                      <span className="text-on-surface-variant"> / {e.melhor}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 type-body-small text-on-surface-variant">
            Sequência: atual / melhor. Só contam os dias previstos desde o início de cada hábito; hoje entra quando
            for feito.
          </p>
        </section>
      </div>

      <section aria-labelledby="titulo-calendario" className="mt-12">
        <h2 id="titulo-calendario" className="mb-4 type-title-large text-on-surface">
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
    <div className="rounded-lg bg-surface-container-low p-4">
      <p className="type-label-medium text-on-surface-variant">{rotulo}</p>
      <p className={cn("mt-1 numero-grande type-headline-medium text-on-surface", t.fracao === null && "text-on-surface-variant")}>{pct(t)}</p>
      <p className="mt-1 type-body-small text-on-surface-variant">
        {t.previstos ? `${t.feitos} de ${t.previstos} previstos` : "Nada previsto ainda"}
      </p>
    </div>
  );
}
