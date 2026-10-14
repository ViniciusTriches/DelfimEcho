import Link from "next/link";
import {
  AlertTriangleIcon,
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  ChevronRightIcon,
  ClockIcon,
  MinusIcon,
  NotebookPenIcon,
  TimerIcon,
} from "lucide-react";
import { AreaIcon } from "@/components/area-icon";
import { Cronometro } from "@/components/cronometro";
import { GraficoRadar } from "@/components/graficos";
import { Horas } from "@/components/horas";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { chipVariants } from "@/components/ui/chip";
import { Progresso } from "@/components/ui/progresso";
import { corArea } from "@/lib/cores-area";
import { formatarDia, formatarDiaMes, formatarDiaSemana, formatarMesAno, somarDias } from "@/lib/datas";
import { formatarHoras } from "@/lib/formato";
import { descreverPrazo } from "@/lib/metas";
import type { Horas as HorasPeriodo } from "@/lib/painel";
import { cn } from "@/lib/utils";
import { carregarPainel } from "./_painel/dados";
import { Heatmap } from "./_painel/heatmap";
import { Checklist } from "./habitos/checklist";
import { MetricaCard } from "./metricas/metrica-card";

const NUM = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1, signDisplay: "exceptZero" });
const ZERO: HorasPeriodo = { efetivas: 0, brutas: 0 };

export default async function DashboardPage() {
  const d = await carregarPainel();
  const totalSemana = somar(d.horas.semana);
  const totalSemanaAnterior = somar(d.horas.semanaAnterior);
  const totalPlano = [...d.plano.values()].reduce((t, h) => t + h, 0);
  const areasDaSemana = d.areas.filter((a) => d.plano.has(a.id) || (d.horas.semana.get(a.id)?.efetivas ?? 0) > 0);
  const temAtencao = d.abandonadas.length > 0 || d.metasProximas.length > 0 || d.lembretesRevisao.length > 0;

  return (
    <>
      <PageHeader titulo="Início" descricao={formatarDiaSemana(d.hoje)} />

      {/* Timer ativo: atalho em destaque (registrar fica no FAB) */}
      {d.timer && (
        <Link
          href="/timer"
          className="camada-estado mb-8 flex min-h-16 items-center gap-4 rounded-lg bg-primary-container px-5 py-3 text-on-primary-container"
        >
          <TimerIcon className="size-6 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block type-label-large">{d.timer.pausado_em ? "Timer pausado" : "Timer rodando"}</span>
            <span className="block truncate type-body-medium">{d.timer.skills?.nome}</span>
          </span>
          <Cronometro timer={d.timer} className="numero-grande type-headline-small" />
        </Link>
      )}

      <div className="grid gap-x-10 gap-y-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Coluna lateral (primeiro no celular): hoje, atenção, registro rápido */}
        <div className="flex flex-col gap-12 lg:order-2">
          {d.checklist.length > 0 && (
            <Secao titulo="Hábitos de hoje" link={{ href: "/habitos", nome: "Ver hábitos" }}>
              <Checklist dia={d.hoje} itens={d.checklist} />
            </Secao>
          )}

          {temAtencao && (
            <Secao titulo="Atenção">
              <ul className="flex flex-col gap-2">
                {d.lembretesRevisao.map((l) => {
                  const semanal = l.tipo === "semanal";
                  return (
                    <li key={l.tipo}>
                      <Link
                        href={semanal ? `/revisoes/semanal?semana=${l.inicio}` : `/revisoes/mensal?mes=${l.inicio.slice(0, 7)}`}
                        className="camada-estado flex min-h-16 items-center gap-4 rounded-lg bg-secondary-container px-4 py-3 text-on-secondary-container"
                      >
                        <NotebookPenIcon className="size-5 shrink-0" aria-hidden />
                        <span className="min-w-0 flex-1">
                          <span className="block type-title-small">{semanal ? "Revisão da semana" : "Revisão do mês"}</span>
                          <span className="block type-body-medium first-letter:uppercase">
                            {semanal
                              ? `Semana de ${formatarDiaMes(l.inicio)} a ${formatarDiaMes(somarDias(l.inicio, 6))}`
                              : formatarMesAno(l.inicio)}{" "}
                            · ainda não feita
                          </span>
                        </span>
                        <ChevronRightIcon className="size-5 shrink-0" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
                {d.abandonadas.map((s) => (
                  <li key={s.id} className="flex min-h-16 items-center gap-4 rounded-lg bg-surface-container-low py-2 pr-2 pl-4">
                    <AlertTriangleIcon className="size-5 shrink-0 text-sequencia" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <Link href={`/habilidades/${s.id}`} className="block truncate type-title-small hover:underline">
                        {s.nome}
                      </Link>
                      <span className="block type-body-medium text-on-surface-variant">
                        {s.ultima
                          ? `Sem sessão há ${s.dias} dias`
                          : s.maisDeUmAno
                            ? "Sem sessão há mais de um ano"
                            : `Nenhuma sessão desde a criação (${s.dias} dias)`}
                      </span>
                    </span>
                    <Link href={`/registrar?habilidade=${s.id}`} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                      Registrar
                    </Link>
                  </li>
                ))}
                {d.metasProximas.map((m) => {
                  const prazo = descreverPrazo(m.prazo, d.hoje);
                  const atrasada = prazo.tom === "atrasada";
                  return (
                    <li key={m.id}>
                      <Link
                        href="/metas"
                        className="camada-estado flex min-h-16 items-center gap-4 rounded-lg bg-surface-container-low px-4 py-3"
                      >
                        {atrasada ? (
                          <AlertTriangleIcon className="size-5 shrink-0 text-error" aria-hidden />
                        ) : (
                          <ClockIcon className="size-5 shrink-0 text-sequencia" aria-hidden />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate type-title-small">{m.titulo}</span>
                          <span className={cn("block type-body-medium", atrasada ? "text-error" : "text-on-surface-variant")}>
                            {prazo.texto} · {formatarDia(m.prazo!)}
                          </span>
                        </span>
                        <ChevronRightIcon className="size-5 shrink-0 text-on-surface-variant" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {d.abandonadas.length > 0 && (
                <p className="mt-3 type-body-small text-on-surface-variant">
                  Habilidades sem sessão há {d.limiteAlerta} dias ou mais.{" "}
                  <Link href="/configuracoes" className="text-primary underline">
                    Mudar o limite
                  </Link>
                </p>
              )}
            </Secao>
          )}

          {d.metricas.length > 0 && (
            <Secao titulo="Registro rápido" link={{ href: "/metricas", nome: "Métricas" }}>
              <ul className="flex flex-col gap-3">
                {d.metricas.map((m) => (
                  <MetricaCard key={m.id} metrica={m} />
                ))}
              </ul>
            </Secao>
          )}
        </div>

        {/* Coluna principal */}
        <div className="flex min-w-0 flex-col gap-12">
          <Secao titulo="Esta semana" id="semana" link={{ href: "/plano", nome: d.plano.size ? "Editar plano" : "Planejar semana" }}>
            <div className="rounded-lg bg-surface-container-low p-5">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                <div>
                  <p className="type-display-small text-on-surface">
                    <Horas valor={totalSemana.efetivas} grande />
                  </p>
                  <p className="type-body-medium text-on-surface-variant">
                    efetivas · {formatarHoras(totalSemana.brutas)} brutas
                    {totalPlano > 0 && ` · plano de ${formatarHoras(totalPlano)}`}
                  </p>
                </div>
                <Variacao atual={totalSemana.efetivas} anterior={totalSemanaAnterior.efetivas} />
              </div>

              {areasDaSemana.length > 0 ? (
                <ul className="flex flex-col gap-4">
                  {areasDaSemana.map((a) => {
                    const feito = d.horas.semana.get(a.id)?.efetivas ?? 0;
                    const plano = d.plano.get(a.id);
                    return (
                      <li key={a.id} className="flex flex-col gap-2">
                        <div className="flex items-baseline justify-between gap-3 type-body-medium">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: corArea(a.cor) }} aria-hidden />
                            <span className="truncate">{a.nome}</span>
                          </span>
                          <span className="shrink-0 text-on-surface">
                            <Horas valor={feito} />
                            <span className="text-on-surface-variant">
                              {plano !== undefined ? <> de <Horas valor={plano} /></> : " · sem plano"}
                            </span>
                          </span>
                        </div>
                        {plano !== undefined && (
                          <Progresso
                            fracao={plano > 0 ? feito / plano : feito > 0 ? 1 : 0}
                            rotulo={`${a.nome}: ${formatarHoras(feito)} de ${formatarHoras(plano)} planejadas`}
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="type-body-medium text-on-surface-variant">
                  Nenhuma hora registrada nesta semana ainda.
                  {!d.plano.size && (
                    <>
                      {" "}
                      <Link href="/plano" className="text-primary underline">
                        Planeje a semana
                      </Link>
                      .
                    </>
                  )}
                </p>
              )}

              {d.destaques.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {d.destaques.map((s) => (
                    <li key={s.id}>
                      <Link href={`/habilidades/${s.id}`} className={chipVariants()}>
                        {s.nome}
                        <span className="text-on-surface">
                          <Horas valor={s.horas.efetivas} />
                        </span>
                        <span className="type-body-small">({formatarHoras(s.horas.brutas)} brutas)</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Secao>

          <Secao titulo="Áreas" link={{ href: "/areas", nome: "Ver áreas" }}>
            <ul className="grid gap-3 sm:grid-cols-2">
              {d.areas.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/areas/${a.id}`}
                    className="camada-estado flex h-full flex-col gap-4 rounded-lg bg-surface-container-low p-4"
                  >
                    <span className="flex items-center gap-3 type-title-medium text-on-surface">
                      <AreaIcon icone={a.icone} cor={a.cor} />
                      {a.nome}
                    </span>
                    <span className="grid grid-cols-2 gap-3">
                      <Periodo rotulo="Semana" h={d.horas.semana.get(a.id) ?? ZERO} anterior={d.horas.semanaAnterior.get(a.id)?.efetivas ?? 0} />
                      <Periodo rotulo="Mês" h={d.horas.mes.get(a.id) ?? ZERO} anterior={d.horas.mesAnterior.get(a.id)?.efetivas ?? 0} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-3 type-body-small text-on-surface-variant">
              Variação comparada ao mesmo ponto da semana e do mês anteriores.
            </p>
          </Secao>

          <Secao titulo="Distribuição entre áreas" descricao="Horas efetivas nos últimos 30 dias: onde está a sua atenção">
            <div className="rounded-lg bg-surface-container-low p-5">
              {d.areas.length >= 3 && [...d.horas.radar.values()].some((h) => h.efetivas > 0) ? (
                <GraficoRadar dados={d.areas.map((a) => ({ area: a.nome, efetivas: d.horas.radar.get(a.id)?.efetivas ?? 0 }))} />
              ) : (
                <p className="type-body-medium text-on-surface-variant">
                  Aparece quando houver horas registradas nos últimos 30 dias (e pelo menos 3 áreas).
                </p>
              )}
            </div>
          </Secao>

          <Secao titulo="Dias com prática" descricao="Últimos 12 meses (no celular, 6 meses)">
            <div className="rounded-lg bg-surface-container-low p-5">
              <Heatmap colunas={d.heatmap} />
            </div>
          </Secao>
        </div>
      </div>
    </>
  );
}

function somar(porArea: Map<string, HorasPeriodo>): HorasPeriodo {
  let efetivas = 0;
  let brutas = 0;
  porArea.forEach((h) => {
    efetivas += h.efetivas;
    brutas += h.brutas;
  });
  return { efetivas, brutas };
}

function Secao({
  titulo,
  descricao,
  link,
  id,
  children,
}: {
  titulo: string;
  descricao?: string;
  link?: { href: string; nome: string };
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="type-title-large text-on-surface">{titulo}</h2>
          {descricao && <p className="mt-0.5 type-body-medium text-on-surface-variant">{descricao}</p>}
        </div>
        {link && (
          <Link href={link.href} className={buttonVariants({ variant: "text", size: "sm", className: "-mr-3 shrink-0" })}>
            {link.nome}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/** Diferença em horas efetivas vs. o mesmo ponto da semana anterior. Texto neutro; a seta indica o sentido. */
function Variacao({ atual, anterior }: { atual: number; anterior: number }) {
  const delta = atual - anterior;
  if (atual === 0 && anterior === 0) return null;
  const Icone = Math.abs(delta) < 0.05 ? MinusIcon : delta > 0 ? ArrowUpRightIcon : ArrowDownRightIcon;
  return (
    <p className="flex items-center gap-1 type-body-medium text-on-surface-variant">
      <Icone className="size-4" aria-hidden />
      <span className="numero">{NUM.format(Math.round(delta * 10) / 10)}</span> h vs. mesmo ponto da semana passada
    </p>
  );
}

function Periodo({ rotulo, h, anterior }: { rotulo: string; h: HorasPeriodo; anterior: number }) {
  const delta = h.efetivas - anterior;
  const Icone = Math.abs(delta) < 0.05 ? MinusIcon : delta > 0 ? ArrowUpRightIcon : ArrowDownRightIcon;
  return (
    <span className="flex flex-col gap-0.5">
      <span className="type-label-medium text-on-surface-variant">{rotulo}</span>
      <span className="type-title-large text-on-surface">
        <Horas valor={h.efetivas} />
      </span>
      <span className="type-body-small text-on-surface-variant">{formatarHoras(h.brutas)} brutas</span>
      <span className="flex items-center gap-0.5 type-body-small text-on-surface-variant">
        <Icone className="size-3.5" aria-hidden />
        {Math.abs(delta) < 0.05 ? "igual" : <><span className="numero">{NUM.format(Math.round(delta * 10) / 10)}</span> h</>}
      </span>
    </span>
  );
}
