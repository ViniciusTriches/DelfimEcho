import Link from "next/link";
import { AlertTriangleIcon, ArrowDownRightIcon, ArrowUpRightIcon, CheckIcon, MinusIcon } from "lucide-react";
import { formatarDataHora, formatarDia, formatarDuracao } from "@/lib/datas";
import { Horas as HorasNum } from "@/components/horas";
import { formatarHoras } from "@/lib/formato";
import type { Taxa } from "@/lib/habitos";
import { formatarValor } from "@/lib/metricas";
import type { Horas } from "@/lib/painel";
import { cn } from "@/lib/utils";
import { LinhaDoTempo } from "../marcos/linha-do-tempo";
import { corArea } from "@/lib/cores-area";
import type { Resumo } from "./dados";

const PCT = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0 });
const NUM = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1, signDisplay: "exceptZero" });
const ZERO: Horas = { efetivas: 0, brutas: 0 };

export function ResumoRevisao({ tipo, r }: { tipo: "semanal" | "mensal"; r: Resumo }) {
  const semanal = tipo === "semanal";
  const linhasAreas = r.areas.filter(
    (a) => r.plano.has(a.id) || (r.horas.get(a.id)?.efetivas ?? 0) > 0 || (r.horasAnterior.get(a.id)?.efetivas ?? 0) > 0,
  );
  const total = soma(r.horas);
  const totalAnterior = soma(r.horasAnterior);
  const totalPlano = [...r.plano.values()].reduce((t, h) => t + h, 0);
  const anterior = semanal ? "semana anterior" : "mês anterior";

  return (
    <div className="flex flex-col gap-12">
      <Secao titulo={semanal ? "Horas por área: planejado × realizado" : "Horas por área"}>
        <div className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-1">
          <div>
            <p className="type-headline-large text-on-surface"><HorasNum valor={total.efetivas} grande /></p>
            <p className="rounded-lg border border-dashed border-outline-variant px-4 py-5 type-body-medium text-on-surface-variant">
              efetivas · {formatarHoras(total.brutas)} brutas · {r.totalSessoes} {r.totalSessoes === 1 ? "sessão" : "sessões"}
              {semanal && totalPlano > 0 && ` · plano de ${formatarHoras(totalPlano)}`}
            </p>
          </div>
          <Delta delta={total.efetivas - totalAnterior.efetivas} rotulo={`vs. ${anterior}`} />
        </div>
        {linhasAreas.length === 0 ? (
          <p className="rounded-lg border border-dashed border-outline-variant px-4 py-5 type-body-medium text-on-surface-variant">Nenhuma hora registrada no período.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg bg-surface-container-low">
            <table className="w-full type-body-medium">
              <thead>
                <tr className="text-left type-label-medium text-on-surface-variant">
                  <th className="px-4 py-3 font-medium">Área</th>
                  {semanal && <th className="px-2 py-3 text-right font-medium">Planejado</th>}
                  <th className="px-2 py-3 text-right font-medium">Realizado</th>
                  {semanal && <th className="px-2 py-3 text-right font-medium">%</th>}
                  <th className="px-4 py-3 text-right font-medium">vs. anterior</th>
                </tr>
              </thead>
              <tbody>
                {linhasAreas.map((a) => {
                  const h = r.horas.get(a.id) ?? ZERO;
                  const plano = r.plano.get(a.id);
                  const delta = h.efetivas - (r.horasAnterior.get(a.id)?.efetivas ?? 0);
                  return (
                    <tr key={a.id} className="border-t border-outline-variant">
                      <td className="px-4 py-2.5 text-on-surface">
                        <span className="flex items-center gap-2">
                          <span className="size-2 rounded-full" style={{ backgroundColor: corArea(a.cor) }} aria-hidden />
                          {a.nome}
                        </span>
                      </td>
                      {semanal && (
                        <td className="numero px-2 py-2.5 text-right text-on-surface-variant">
                          {plano !== undefined ? formatarHoras(plano) : "—"}
                        </td>
                      )}
                      <td className="numero px-2 py-2.5 text-right">
                        <span className="type-title-small text-on-surface">{formatarHoras(h.efetivas)}</span>
                        <span className="block type-body-small text-on-surface-variant">{formatarHoras(h.brutas)} brutas</span>
                      </td>
                      {semanal && (
                        <td className="numero px-2 py-2.5 text-right text-on-surface">
                          {plano ? PCT.format(h.efetivas / plano) : "—"}
                        </td>
                      )}
                      <td className="numero px-4 py-2.5 text-right text-on-surface-variant">
                        {Math.abs(delta) < 0.05 ? "igual" : `${NUM.format(Math.round(delta * 10) / 10)} h`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Secao>

      {r.habitos.length > 0 && (
        <Secao titulo="Hábitos">
          <p className="mb-4 type-body-medium">
            <span className="numero-grande type-headline-small text-on-surface">{pct(r.habitosGeral)}</span>
            <span className="text-on-surface-variant">
              {" "}
              de cumprimento · {r.habitosGeral.feitos} de {r.habitosGeral.previstos} previstos
            </span>
          </p>
          <ul className="grid gap-x-8 type-body-medium sm:grid-cols-2">
            {r.habitos.map((h) => (
              <li key={h.id} className="flex min-h-11 items-center justify-between gap-2 border-b border-outline-variant">
                <span className="truncate text-on-surface">{h.nome}</span>
                <span className="numero text-on-surface-variant">
                  {h.taxa.previstos ? `${h.taxa.feitos}/${h.taxa.previstos} · ${pct(h.taxa)}` : "—"}
                </span>
              </li>
            ))}
          </ul>
        </Secao>
      )}

      <Secao titulo="Metas">
        {r.metasConcluidas.length === 0 && r.metasPendentes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-outline-variant px-4 py-5 type-body-medium text-on-surface-variant">Nenhuma meta concluída nem vencendo no período.</p>
        ) : (
          <ul className="flex flex-col gap-2 type-body-medium">
            {r.metasConcluidas.map((m) => (
              <li key={m.id} className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-concluido" aria-hidden />
                <span>
                  <span className="font-medium text-on-surface">{m.titulo}</span>
                  <span className="text-on-surface-variant">
                    {" "}
                    · concluída em {formatarDia(m.concluida_em!.slice(0, 10))}
                    {m.areas && ` · ${m.areas.nome}`}
                  </span>
                </span>
              </li>
            ))}
            {r.metasPendentes.map((m) => (
              <li key={m.id} className="flex items-start gap-2">
                <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-sequencia" aria-hidden />
                <span>
                  <Link href="/metas" className="font-medium text-on-surface underline-offset-4 hover:underline">
                    {m.titulo}
                  </Link>
                  <span className="text-on-surface-variant">
                    {" "}
                    · ainda ativa, prazo {formatarDia(m.prazo!)}
                    {m.areas && ` · ${m.areas.nome}`}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Secao>

      {(!semanal || r.metricas.length > 0) && (
        <Secao titulo={semanal ? "Métricas da semana" : "Métricas do mês"}>
          {r.metricas.length === 0 ? (
            <p className="rounded-lg border border-dashed border-outline-variant px-4 py-5 type-body-medium text-on-surface-variant">Nenhum valor de métrica registrado no período.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-outline-variant overflow-hidden rounded-lg bg-surface-container-low type-body-medium">
              {r.metricas.map((m) => {
                const v = m.variacao;
                const Icone = !v || v.delta === 0 ? MinusIcon : v.delta > 0 ? ArrowUpRightIcon : ArrowDownRightIcon;
                return (
                  <li key={m.id} className="flex min-h-14 flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2">
                    <Link href={`/metricas/${m.id}`} className="min-w-32 flex-1 font-medium text-on-surface underline-offset-4 hover:underline">
                      {m.nome}
                    </Link>
                    <span className="numero text-on-surface-variant">
                      {m.registros > 1
                        ? `${formatarValor(m.primeiro.valor, m.unidade)} → `
                        : ""}
                      <span className="text-on-surface">{formatarValor(m.ultimo.valor, m.unidade)}</span>
                    </span>
                    <span className="numero flex items-center gap-1 type-body-small text-on-surface-variant">
                      {v ? (
                        <>
                          <Icone
                            className={cn(
                              "size-3.5",
                              v.melhorou === true && "text-concluido",
                              v.melhorou === false && "text-error",
                            )}
                            aria-hidden
                          />
                          {v.delta > 0 ? "+" : ""}
                          {formatarValor(v.delta, m.unidade)}
                          {v.melhorou !== null && ` (${v.melhorou ? "melhorou" : "piorou"})`}
                        </>
                      ) : (
                        "1 registro"
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Secao>
      )}

      {(!semanal || r.marcos.length > 0) && (
        <Secao titulo={semanal ? "Marcos da semana" : "Marcos do mês"}>
          {r.marcos.length ? (
            <LinhaDoTempo marcos={r.marcos} />
          ) : (
            <p className="rounded-lg border border-dashed border-outline-variant px-4 py-5 type-body-medium text-on-surface-variant">Nenhum marco no período.</p>
          )}
        </Secao>
      )}

      <Secao titulo="Melhores sessões">
        {r.melhoresSessoes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-outline-variant px-4 py-5 type-body-medium text-on-surface-variant">Nenhuma sessão no período.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {r.melhoresSessoes.map((s) => (
              <li key={s.id} className="rounded-lg bg-surface-container-low px-4 py-3 type-body-medium">
                <p className="text-on-surface-variant">
                  <Link href={`/habilidades/${s.skill_id}`} className="font-medium text-on-surface underline-offset-4 hover:underline">
                    {s.habilidade}
                  </Link>{" "}
                  · {formatarDataHora(s.inicio!)} · {formatarDuracao(s.duracao_minutos!)} · nota {s.nota_qualidade} ·{" "}
                  {formatarHoras(s.horas_efetivas)} efetivas
                </p>
                {s.foco_especifico && <p className="mt-1 type-title-small text-on-surface">{s.foco_especifico}</p>}
                {s.aprendizado && (
                  <p className="mt-1 whitespace-pre-line text-on-surface">
                    <span className="type-body-small text-on-surface-variant">Aprendi: </span>
                    {s.aprendizado}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Secao>
    </div>
  );
}

function soma(porArea: Map<string, Horas>): Horas {
  let efetivas = 0;
  let brutas = 0;
  porArea.forEach((h) => {
    efetivas += h.efetivas;
    brutas += h.brutas;
  });
  return { efetivas, brutas };
}

function pct(t: Taxa) {
  return t.fracao === null ? "—" : PCT.format(t.fracao);
}

function Delta({ delta, rotulo }: { delta: number; rotulo: string }) {
  const Icone = Math.abs(delta) < 0.05 ? MinusIcon : delta > 0 ? ArrowUpRightIcon : ArrowDownRightIcon;
  return (
    <p className="flex items-center gap-1 pb-1 type-body-medium text-on-surface-variant">
      <Icone className="size-4" aria-hidden />
      <span className="numero">{Math.abs(delta) < 0.05 ? "igual" : `${NUM.format(Math.round(delta * 10) / 10)} h`}</span>
      {rotulo}
    </p>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 type-title-large text-on-surface">{titulo}</h2>
      {children}
    </section>
  );
}
