import Link from "next/link";
import { AlertTriangleIcon, ArrowDownRightIcon, ArrowUpRightIcon, CheckIcon, MinusIcon } from "lucide-react";
import { formatarDataHora, formatarDia, formatarDuracao } from "@/lib/datas";
import { formatarHoras } from "@/lib/formato";
import type { Taxa } from "@/lib/habitos";
import { formatarValor } from "@/lib/metricas";
import type { Horas } from "@/lib/painel";
import { cn } from "@/lib/utils";
import { LinhaDoTempo } from "../marcos/linha-do-tempo";
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
    <div className="flex flex-col gap-10">
      <Secao titulo={semanal ? "Horas por área: planejado × realizado" : "Horas por área"}>
        <div className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-1">
          <div>
            <p className="text-3xl font-semibold">{formatarHoras(total.efetivas)}</p>
            <p className="text-sm text-muted-foreground">
              efetivas · {formatarHoras(total.brutas)} brutas · {r.totalSessoes} {r.totalSessoes === 1 ? "sessão" : "sessões"}
              {semanal && totalPlano > 0 && ` · plano de ${formatarHoras(totalPlano)}`}
            </p>
          </div>
          <Delta delta={total.efetivas - totalAnterior.efetivas} rotulo={`vs. ${anterior}`} />
        </div>
        {linhasAreas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma hora registrada no período.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-normal">Área</th>
                  {semanal && <th className="px-2 py-2 text-right font-normal">Planejado</th>}
                  <th className="px-2 py-2 text-right font-normal">Realizado</th>
                  {semanal && <th className="px-2 py-2 text-right font-normal">%</th>}
                  <th className="px-3 py-2 text-right font-normal">vs. anterior</th>
                </tr>
              </thead>
              <tbody>
                {linhasAreas.map((a) => {
                  const h = r.horas.get(a.id) ?? ZERO;
                  const plano = r.plano.get(a.id);
                  const delta = h.efetivas - (r.horasAnterior.get(a.id)?.efetivas ?? 0);
                  return (
                    <tr key={a.id} className="border-t">
                      <td className="px-3 py-2">
                        <span className="flex items-center gap-2">
                          <span className="size-2 rounded-full" style={{ backgroundColor: a.cor }} aria-hidden />
                          {a.nome}
                        </span>
                      </td>
                      {semanal && (
                        <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">
                          {plano !== undefined ? formatarHoras(plano) : "—"}
                        </td>
                      )}
                      <td className="px-2 py-2 text-right tabular-nums">
                        <strong>{formatarHoras(h.efetivas)}</strong>
                        <span className="block text-xs text-muted-foreground">{formatarHoras(h.brutas)} brutas</span>
                      </td>
                      {semanal && (
                        <td className="px-2 py-2 text-right tabular-nums">
                          {plano ? PCT.format(h.efetivas / plano) : "—"}
                        </td>
                      )}
                      <td className="px-3 py-2 text-right text-muted-foreground tabular-nums">
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
          <p className="mb-3 text-sm">
            <strong className="text-2xl font-semibold">{pct(r.habitosGeral)}</strong>
            <span className="text-muted-foreground">
              {" "}
              de cumprimento · {r.habitosGeral.feitos} de {r.habitosGeral.previstos} previstos
            </span>
          </p>
          <ul className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            {r.habitos.map((h) => (
              <li key={h.id} className="flex justify-between gap-2 border-b py-1.5">
                <span className="truncate">{h.nome}</span>
                <span className="tabular-nums text-muted-foreground">
                  {h.taxa.previstos ? `${h.taxa.feitos}/${h.taxa.previstos} · ${pct(h.taxa)}` : "—"}
                </span>
              </li>
            ))}
          </ul>
        </Secao>
      )}

      <Secao titulo="Metas">
        {r.metasConcluidas.length === 0 && r.metasPendentes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma meta concluída nem vencendo no período.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {r.metasConcluidas.map((m) => (
              <li key={m.id} className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-[var(--concluido)]" aria-hidden />
                <span>
                  <strong className="font-medium">{m.titulo}</strong>
                  <span className="text-muted-foreground">
                    {" "}
                    · concluída em {formatarDia(m.concluida_em!.slice(0, 10))}
                    {m.areas && ` · ${m.areas.nome}`}
                  </span>
                </span>
              </li>
            ))}
            {r.metasPendentes.map((m) => (
              <li key={m.id} className="flex items-start gap-2">
                <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-[var(--sequencia)]" aria-hidden />
                <span>
                  <Link href="/metas" className="font-medium hover:text-primary">
                    {m.titulo}
                  </Link>
                  <span className="text-muted-foreground">
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
            <p className="text-sm text-muted-foreground">Nenhum valor de métrica registrado no período.</p>
          ) : (
            <ul className="flex flex-col divide-y rounded-xl border text-sm">
              {r.metricas.map((m) => {
                const v = m.variacao;
                const Icone = !v || v.delta === 0 ? MinusIcon : v.delta > 0 ? ArrowUpRightIcon : ArrowDownRightIcon;
                return (
                  <li key={m.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2">
                    <Link href={`/metricas/${m.id}`} className="min-w-32 flex-1 font-medium hover:text-primary">
                      {m.nome}
                    </Link>
                    <span className="tabular-nums text-muted-foreground">
                      {m.registros > 1
                        ? `${formatarValor(m.primeiro.valor, m.unidade)} → `
                        : ""}
                      <span className="text-foreground">{formatarValor(m.ultimo.valor, m.unidade)}</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                      {v ? (
                        <>
                          <Icone
                            className={cn(
                              "size-3.5",
                              v.melhorou === true && "text-[var(--concluido)]",
                              v.melhorou === false && "text-destructive",
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
            <p className="text-sm text-muted-foreground">Nenhum marco no período.</p>
          )}
        </Secao>
      )}

      <Secao titulo="Melhores sessões">
        {r.melhoresSessoes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma sessão no período.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {r.melhoresSessoes.map((s) => (
              <li key={s.id} className="rounded-xl border p-3 text-sm">
                <p className="text-muted-foreground">
                  <Link href={`/habilidades/${s.skill_id}`} className="font-medium text-foreground hover:text-primary">
                    {s.habilidade}
                  </Link>{" "}
                  · {formatarDataHora(s.inicio!)} · {formatarDuracao(s.duracao_minutos!)} · nota {s.nota_qualidade} ·{" "}
                  {formatarHoras(s.horas_efetivas)} efetivas
                </p>
                {s.foco_especifico && <p className="mt-1 font-medium">{s.foco_especifico}</p>}
                {s.aprendizado && (
                  <p className="mt-1 whitespace-pre-line">
                    <span className="text-xs text-muted-foreground">Aprendi: </span>
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
    <p className="flex items-center gap-1 pb-1 text-sm text-muted-foreground">
      <Icone className="size-4" aria-hidden />
      <span className="tabular-nums">{Math.abs(delta) < 0.05 ? "igual" : `${NUM.format(Math.round(delta * 10) / 10)} h`}</span>
      {rotulo}
    </p>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{titulo}</h2>
      {children}
    </section>
  );
}
