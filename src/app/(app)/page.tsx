import Link from "next/link";
import {
  AlertTriangleIcon,
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  ChevronRightIcon,
  ClockIcon,
  MinusIcon,
  NotebookPenIcon,
  PencilIcon,
  PlusCircleIcon,
  TimerIcon,
} from "lucide-react";
import { AreaIcon } from "@/components/area-icon";
import { Cronometro } from "@/components/cronometro";
import { GraficoRadar } from "@/components/graficos";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { formatarDia, formatarDiaMes, formatarDiaSemana, formatarMesAno, somarDias } from "@/lib/datas";
import { formatarHoras } from "@/lib/formato";
import { descreverPrazo } from "@/lib/metas";
import type { Horas } from "@/lib/painel";
import { cn } from "@/lib/utils";
import { carregarPainel } from "./_painel/dados";
import { Heatmap } from "./_painel/heatmap";
import { Checklist } from "./habitos/checklist";
import { MetricaCard } from "./metricas/metrica-card";

const NUM = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1, signDisplay: "exceptZero" });
const ZERO: Horas = { efetivas: 0, brutas: 0 };

export default async function DashboardPage() {
  const d = await carregarPainel();
  const totalSemana = somar(d.horas.semana);
  const totalSemanaAnterior = somar(d.horas.semanaAnterior);
  const totalPlano = [...d.plano.values()].reduce((t, h) => t + h, 0);
  const areasDaSemana = d.areas.filter((a) => d.plano.has(a.id) || (d.horas.semana.get(a.id)?.efetivas ?? 0) > 0);

  return (
    <>
      <PageHeader titulo="Início" descricao={formatarDiaSemana(d.hoje)} />

      {/* Ação principal + timer */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/registrar" className={buttonVariants({ size: "lg", className: "h-14 text-base sm:flex-1" })}>
          <PlusCircleIcon className="size-5" />
          Registrar sessão
        </Link>
        {d.timer ? (
          <Link
            href="/timer"
            className="flex h-14 items-center justify-center gap-3 rounded-lg border border-primary/40 bg-primary/10 px-5 font-medium text-primary transition-colors duration-150 hover:bg-primary/15"
          >
            <TimerIcon className="size-5" aria-hidden />
            <Cronometro timer={d.timer} className="font-mono text-lg tabular-nums" />
            <span className="truncate">{d.timer.skills?.nome}</span>
          </Link>
        ) : (
          <Link href="/registrar" className={buttonVariants({ variant: "outline", size: "lg", className: "h-14" })}>
            <TimerIcon className="size-5" />
            Iniciar timer
          </Link>
        )}
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Coluna lateral (primeiro no celular): hoje, alertas, métricas */}
        <div className="flex flex-col gap-10 lg:order-2">
          {d.checklist.length > 0 && (
            <Secao titulo="Hábitos de hoje" link={{ href: "/habitos", nome: "Ver hábitos" }}>
              <Checklist dia={d.hoje} itens={d.checklist} />
            </Secao>
          )}

          {(d.abandonadas.length > 0 || d.metasProximas.length > 0 || d.lembretesRevisao.length > 0) && (
            <Secao titulo="Atenção">
              <ul className="flex flex-col gap-2">
                {d.lembretesRevisao.map((l) => {
                  const semanal = l.tipo === "semanal";
                  return (
                    <li key={l.tipo}>
                      <Link
                        href={semanal ? `/revisoes/semanal?semana=${l.inicio}` : `/revisoes/mensal?mes=${l.inicio.slice(0, 7)}`}
                        className="flex min-h-14 items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3 transition-colors duration-150 hover:bg-primary/10"
                      >
                        <NotebookPenIcon className="size-4 shrink-0 text-primary" aria-hidden />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{semanal ? "Revisão da semana" : "Revisão do mês"}</p>
                          <p className="text-xs text-muted-foreground first-letter:uppercase">
                            {semanal
                              ? `Semana de ${formatarDiaMes(l.inicio)} a ${formatarDiaMes(somarDias(l.inicio, 6))}`
                              : formatarMesAno(l.inicio)}{" "}
                            · ainda não feita
                          </p>
                        </div>
                        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
                {d.abandonadas.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                    <AlertTriangleIcon className="size-4 shrink-0 text-[var(--sequencia)]" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <Link href={`/habilidades/${s.id}`} className="block truncate font-medium hover:text-primary">
                        {s.nome}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {s.ultima
                          ? `Sem sessão há ${s.dias} dias`
                          : s.maisDeUmAno
                            ? "Sem sessão há mais de um ano"
                            : `Nenhuma sessão desde a criação (${s.dias} dias)`}
                        {" · "}
                        {s.area}
                      </p>
                    </div>
                    <Link
                      href={`/registrar?habilidade=${s.id}`}
                      className={buttonVariants({ variant: "outline", size: "sm", className: "min-h-11 shrink-0 sm:min-h-7" })}
                    >
                      Registrar
                    </Link>
                  </li>
                ))}
                {d.metasProximas.map((m) => {
                  const prazo = descreverPrazo(m.prazo, d.hoje);
                  return (
                    <li key={m.id}>
                      <Link
                        href="/metas"
                        className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors duration-150 hover:bg-muted/60"
                      >
                        {prazo.tom === "atrasada" ? (
                          <AlertTriangleIcon className="size-4 shrink-0 text-destructive" aria-hidden />
                        ) : (
                          <ClockIcon className="size-4 shrink-0 text-[var(--sequencia)]" aria-hidden />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{m.titulo}</p>
                          <p className={cn("text-xs", prazo.tom === "atrasada" ? "text-destructive" : "text-muted-foreground")}>
                            Meta · {prazo.texto} · {formatarDia(m.prazo!)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {d.abandonadas.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Alerta de abandono: {d.limiteAlerta} dias sem sessão.{" "}
                  <Link href="/configuracoes" className="underline underline-offset-2">
                    Mudar
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
        <div className="flex min-w-0 flex-col gap-10">
          <Secao titulo="Esta semana" id="semana" link={{ href: "/plano", nome: d.plano.size ? "Editar plano" : "Planejar semana" }}>
            <div className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-2">
              <div>
                <p className="text-4xl font-semibold">{formatarHoras(totalSemana.efetivas)}</p>
                <p className="text-sm text-muted-foreground">
                  efetivas · {formatarHoras(totalSemana.brutas)} brutas
                  {totalPlano > 0 && ` · plano de ${formatarHoras(totalPlano)}`}
                </p>
              </div>
              <Variacao atual={totalSemana.efetivas} anterior={totalSemanaAnterior.efetivas} periodo="semana" />
            </div>

            {areasDaSemana.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {areasDaSemana.map((a) => {
                  const feito = d.horas.semana.get(a.id)?.efetivas ?? 0;
                  const plano = d.plano.get(a.id);
                  return (
                    <li key={a.id}>
                      <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                        <span className="flex items-center gap-2">
                          <span className="size-2 rounded-full" style={{ backgroundColor: a.cor }} aria-hidden />
                          {a.nome}
                        </span>
                        <span className="tabular-nums">
                          <strong>{formatarHoras(feito)}</strong>
                          <span className="text-muted-foreground">
                            {plano !== undefined ? ` de ${formatarHoras(plano)}` : " · sem plano"}
                          </span>
                        </span>
                      </div>
                      {plano !== undefined && (
                        <div
                          className="h-2 overflow-hidden rounded-full bg-[var(--viz-bruta)]/35"
                          role="progressbar"
                          aria-label={`${a.nome}: ${formatarHoras(feito)} de ${formatarHoras(plano)} planejadas`}
                          aria-valuemin={0}
                          aria-valuemax={plano}
                          aria-valuenow={Math.min(feito, plano)}
                        >
                          <div
                            className="h-full rounded-full bg-[var(--viz-efetiva)]"
                            style={{ width: `${plano > 0 ? Math.min(100, (feito / plano) * 100) : feito > 0 ? 100 : 0}%` }}
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma hora registrada nesta semana ainda.{" "}
                {!d.plano.size && (
                  <Link href="/plano" className="underline underline-offset-2">
                    Planeje a semana
                  </Link>
                )}
              </p>
            )}

            {d.destaques.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {d.destaques.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/habilidades/${s.id}`}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors duration-150 hover:bg-muted"
                    >
                      {s.nome}:
                      <strong className="tabular-nums">{formatarHoras(s.horas.efetivas)}</strong>
                      <span className="text-muted-foreground">({formatarHoras(s.horas.brutas)} brutas)</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Secao>

          <Secao titulo="Áreas" link={{ href: "/areas", nome: "Ver áreas" }}>
            <ul className="grid gap-3 sm:grid-cols-2">
              {d.areas.map((a) => {
                const semana = d.horas.semana.get(a.id) ?? ZERO;
                const mes = d.horas.mes.get(a.id) ?? ZERO;
                return (
                  <li key={a.id}>
                    <Link
                      href={`/areas/${a.id}`}
                      className="flex h-full flex-col gap-3 rounded-xl border bg-card p-4 transition-colors duration-150 hover:bg-muted/50"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <AreaIcon icone={a.icone} cor={a.cor} className="size-8" />
                        {a.nome}
                      </span>
                      <span className="grid grid-cols-2 gap-3 text-sm">
                        <Periodo rotulo="Semana" h={semana} anterior={d.horas.semanaAnterior.get(a.id)?.efetivas ?? 0} />
                        <Periodo rotulo="Mês" h={mes} anterior={d.horas.mesAnterior.get(a.id)?.efetivas ?? 0} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              Variação comparada ao mesmo ponto da semana e do mês anteriores.
            </p>
          </Secao>

          <Secao titulo="Distribuição entre áreas" descricao="Horas efetivas nos últimos 30 dias: onde está a sua atenção">
            {d.areas.length >= 3 && [...d.horas.radar.values()].some((h) => h.efetivas > 0) ? (
              <GraficoRadar dados={d.areas.map((a) => ({ area: a.nome, efetivas: d.horas.radar.get(a.id)?.efetivas ?? 0 }))} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Aparece quando houver horas registradas nos últimos 30 dias (e pelo menos 3 áreas).
              </p>
            )}
          </Secao>

          <Secao titulo="Dias com prática" descricao="Últimos 12 meses (no celular, 6 meses)">
            <Heatmap colunas={d.heatmap} />
          </Secao>
        </div>
      </div>
    </>
  );
}

function somar(porArea: Map<string, Horas>): Horas {
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
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">{titulo}</h2>
          {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
        </div>
        {link && (
          <Link href={link.href} className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm text-primary underline-offset-4 hover:underline sm:min-h-0">
            {link.nome.startsWith("Editar") && <PencilIcon className="size-3.5" aria-hidden />}
            {link.nome}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/** Diferença em horas efetivas vs. o mesmo ponto do período anterior. Texto neutro, seta indica o sentido. */
function Variacao({ atual, anterior, periodo }: { atual: number; anterior: number; periodo: "semana" | "mês" }) {
  const delta = atual - anterior;
  if (atual === 0 && anterior === 0) return null;
  const Icone = Math.abs(delta) < 0.05 ? MinusIcon : delta > 0 ? ArrowUpRightIcon : ArrowDownRightIcon;
  return (
    <p className="flex items-center gap-1 pb-1 text-sm text-muted-foreground">
      <Icone className="size-4" aria-hidden />
      <span className="tabular-nums">{NUM.format(Math.round(delta * 10) / 10)} h</span>
      vs. mesmo ponto {periodo === "semana" ? "da semana passada" : "do mês passado"}
    </p>
  );
}

function Periodo({ rotulo, h, anterior }: { rotulo: string; h: Horas; anterior: number }) {
  const delta = h.efetivas - anterior;
  const Icone = Math.abs(delta) < 0.05 ? MinusIcon : delta > 0 ? ArrowUpRightIcon : ArrowDownRightIcon;
  return (
    <span className="flex flex-col">
      <span className="text-xs text-muted-foreground">{rotulo}</span>
      <span className="text-lg font-semibold tabular-nums">{formatarHoras(h.efetivas)}</span>
      <span className="text-xs text-muted-foreground tabular-nums">{formatarHoras(h.brutas)} brutas</span>
      <span className="mt-0.5 flex items-center gap-0.5 text-xs text-muted-foreground tabular-nums">
        <Icone className="size-3.5" aria-hidden />
        {Math.abs(delta) < 0.05 ? "igual" : `${NUM.format(Math.round(delta * 10) / 10)} h`}
      </span>
    </span>
  );
}
