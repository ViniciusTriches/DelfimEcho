"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatarHoras } from "@/lib/formato";
import { formatarValor } from "@/lib/metricas";

// Tokens definidos em globals.css (claro/escuro): par ordinal azul validado.
const COR = {
  efetiva: "var(--viz-efetiva)",
  bruta: "var(--viz-bruta)",
  grade: "var(--viz-grade)",
  eixo: "var(--viz-eixo)",
  mudo: "var(--viz-mudo)",
  superficie: "var(--card)",
};

const EIXO = { fontSize: 12, fill: COR.mudo };
const NUM = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

function CaixaTooltip({ titulo, linhas }: { titulo: string; linhas: { cor: string; nome: string; valor: string }[] }) {
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="mb-1 font-medium">{titulo}</p>
      {linhas.map((l) => (
        <p key={l.nome} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ backgroundColor: l.cor }} aria-hidden />
          <span className="text-muted-foreground">{l.nome}</span>
          <span className="ml-auto pl-3 font-medium tabular-nums">{l.valor}</span>
        </p>
      ))}
    </div>
  );
}

function Legenda({ itens }: { itens: { cor: string; nome: string; linha?: boolean }[] }) {
  return (
    <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {itens.map((i) => (
        <li key={i.nome} className="flex items-center gap-1.5">
          {i.linha ? (
            <span className="h-px w-3.5" style={{ backgroundColor: i.cor }} aria-hidden />
          ) : (
            <span className="size-2.5 rounded-sm" style={{ backgroundColor: i.cor }} aria-hidden />
          )}
          {i.nome}
        </li>
      ))}
    </ul>
  );
}

function Tabela({ cabecalho, linhas }: { cabecalho: string[]; linhas: string[][] }) {
  return (
    <details className="mt-2 text-xs">
      <summary className="cursor-pointer text-muted-foreground">Ver tabela</summary>
      <table className="mt-2 w-full tabular-nums">
        <thead>
          <tr className="text-left text-muted-foreground">
            {cabecalho.map((c, i) => (
              <th key={c} className={i ? "py-1 text-right font-normal" : "py-1 font-normal"}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l, i) => (
            <tr key={i} className="border-t">
              {l.map((v, i) => (
                <td key={i} className={i ? "py-1 text-right" : "py-1"}>
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

export type PontoHoras = { rotulo: string; titulo: string; efetivas: number; brutas: number };

/** Colunas de horas efetivas e brutas por período, com linha de meta opcional. */
export function GraficoHoras({ dados, meta }: { dados: PontoHoras[]; meta?: number }) {
  const maximo = Math.max(meta ?? 0, ...dados.map((d) => d.brutas));
  return (
    <div>
      <Legenda
        itens={[
          { cor: COR.efetiva, nome: "Horas efetivas" },
          { cor: COR.bruta, nome: "Horas brutas" },
          ...(meta ? [{ cor: COR.mudo, nome: `Meta (${formatarHoras(meta)})`, linha: true }] : []),
        ]}
      />
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} barGap={2} barCategoryGap="20%" margin={{ top: 8, right: 4, bottom: 0, left: -12 }}>
            <CartesianGrid vertical={false} stroke={COR.grade} />
            <XAxis dataKey="rotulo" tick={EIXO} tickLine={false} axisLine={{ stroke: COR.eixo }} interval="preserveStartEnd" minTickGap={8} />
            <YAxis
              tick={EIXO}
              tickLine={false}
              axisLine={false}
              allowDecimals
              domain={[0, maximo > 0 ? "auto" : 1]}
              tickFormatter={(v: number) => NUM.format(v)}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.6 }}
              content={({ active, payload }) => {
                const p = active ? (payload?.[0]?.payload as PontoHoras | undefined) : undefined;
                if (!p) return null;
                return (
                  <CaixaTooltip
                    titulo={p.titulo}
                    linhas={[
                      { cor: COR.efetiva, nome: "Efetivas", valor: formatarHoras(p.efetivas) },
                      { cor: COR.bruta, nome: "Brutas", valor: formatarHoras(p.brutas) },
                    ]}
                  />
                );
              }}
            />
            {meta ? <ReferenceLine y={meta} stroke={COR.mudo} strokeWidth={1} ifOverflow="extendDomain" /> : null}
            <Bar dataKey="brutas" name="Brutas" fill={COR.bruta} radius={[4, 4, 0, 0]} maxBarSize={12} isAnimationActive={false} />
            <Bar dataKey="efetivas" name="Efetivas" fill={COR.efetiva} radius={[4, 4, 0, 0]} maxBarSize={12} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Tabela
        cabecalho={["Período", "Efetivas", "Brutas"]}
        linhas={dados.map((d) => [d.titulo, formatarHoras(d.efetivas), formatarHoras(d.brutas)])}
      />
    </div>
  );
}

export type PontoLinha = { rotulo: string; titulo: string; valor: number | null };

/**
 * Uma série ao longo do tempo (nota média, autoavaliação, métrica). Sem legenda de série:
 * o título da seção nomeia a série; só a meta (se houver) ganha item de legenda.
 * Sem `dominio`, o eixo se ajusta aos dados (e à meta).
 */
export function GraficoLinha({
  dados,
  dominio,
  nome,
  unidade,
  meta,
}: {
  dados: PontoLinha[];
  dominio?: [number, number];
  nome: string;
  unidade?: string | null;
  meta?: number | null;
}) {
  const formatar = (v: number) => formatarValor(v, unidade);
  const temMeta = meta !== null && meta !== undefined;
  return (
    <div>
      {temMeta && <Legenda itens={[{ cor: COR.mudo, nome: `Meta (${formatar(meta)})`, linha: true }]} />}
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dados} margin={{ top: 8, right: 8, bottom: 0, left: dominio ? -20 : 0 }}>
            <CartesianGrid vertical={false} stroke={COR.grade} />
            <XAxis dataKey="rotulo" tick={EIXO} tickLine={false} axisLine={{ stroke: COR.eixo }} interval="preserveStartEnd" minTickGap={8} />
            <YAxis
              domain={dominio ?? ["auto", "auto"]}
              tick={EIXO}
              tickLine={false}
              axisLine={false}
              allowDecimals={!dominio}
              tickFormatter={(v: number) => NUM.format(v)}
              width={dominio ? 60 : 48}
            />
            {temMeta && <ReferenceLine y={meta} stroke={COR.mudo} strokeWidth={1} ifOverflow="extendDomain" />}
            <Tooltip
              cursor={{ stroke: COR.eixo, strokeWidth: 1 }}
              content={({ active, payload }) => {
                const p = active ? (payload?.[0]?.payload as PontoLinha | undefined) : undefined;
                if (!p || p.valor === null) return null;
                return <CaixaTooltip titulo={p.titulo} linhas={[{ cor: COR.efetiva, nome, valor: formatar(p.valor) }]} />;
              }}
            />
            <Line
              type="monotone"
              dataKey="valor"
              stroke={COR.efetiva}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              connectNulls
              dot={{ r: 4, fill: COR.efetiva, stroke: COR.superficie, strokeWidth: 2 }}
              activeDot={{ r: 6, fill: COR.efetiva, stroke: COR.superficie, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <Tabela
        cabecalho={["Período", nome]}
        linhas={dados.filter((d) => d.valor !== null).map((d) => [d.titulo, formatar(d.valor!)])}
      />
    </div>
  );
}
