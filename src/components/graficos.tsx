"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useId } from "react";
import { ChevronDownIcon } from "lucide-react";
import { formatarHoras } from "@/lib/formato";
import { formatarValor } from "@/lib/metricas";

// Tokens de globals.css (claro/escuro): par ordinal da rampa da primária, validado.
// Os gráficos ficam em cartões surface-container-low: o anel dos pontos usa essa superfície.
const COR = {
  efetiva: "var(--viz-efetiva)",
  bruta: "var(--viz-bruta)",
  grade: "var(--viz-grade)",
  eixo: "var(--viz-eixo)",
  mudo: "var(--viz-mudo)",
  superficie: "var(--md-surface-container-low)",
  cursor: "var(--md-surface-container-highest)",
};

const EIXO = { fontSize: 12, fill: COR.mudo, fontFamily: "var(--font-roboto-mono)" };
const EIXO_TEXTO = { fontSize: 12, fill: COR.mudo };
const NUM = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

function CaixaTooltip({
  titulo,
  linhas,
}: {
  titulo: string;
  linhas: { cor: string; nome: string; valor: string; listrada?: boolean }[];
}) {
  return (
    <div className="min-w-36 rounded-md bg-surface-container-highest px-3 py-2.5 type-body-small text-on-surface shadow-elev-2">
      <p className="mb-1.5 type-title-small">{titulo}</p>
      {linhas.map((l) => (
        <p key={l.nome} className="flex items-center gap-2">
          <Chave cor={l.cor} listrada={l.listrada} />
          <span className="text-on-surface-variant">{l.nome}</span>
          <span className="numero ml-auto pl-3 font-medium">{l.valor}</span>
        </p>
      ))}
    </div>
  );
}

// Horas brutas: a cor clara sozinha não chega a 3:1 sobre o cartão, então a barra leva
// listras a 45° e contorno na cor das efetivas (que passa de 3:1). Identidade sem depender só da cor.
const LISTRAS = "repeating-linear-gradient(135deg, var(--viz-efetiva) 0 1.5px, transparent 1.5px 4px)";

/** Amostra de série (legenda e tooltip): quadrado; brutas com listras e contorno, como a barra. */
function Chave({ cor, listrada }: { cor: string; listrada?: boolean }) {
  return listrada ? (
    <span
      className="size-3 shrink-0 rounded-[3px] border"
      style={{ backgroundColor: cor, backgroundImage: LISTRAS, borderColor: COR.efetiva }}
      aria-hidden
    />
  ) : (
    <span className="size-3 shrink-0 rounded-[3px]" style={{ backgroundColor: cor }} aria-hidden />
  );
}

function Legenda({ itens }: { itens: { cor: string; nome: string; linha?: boolean; listrada?: boolean }[] }) {
  return (
    <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 type-label-medium text-on-surface-variant">
      {itens.map((i) => (
        <li key={i.nome} className="flex items-center gap-1.5">
          {i.linha ? (
            <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: i.cor }} aria-hidden />
          ) : (
            <Chave cor={i.cor} listrada={i.listrada} />
          )}
          {i.nome}
        </li>
      ))}
    </ul>
  );
}

function Tabela({ cabecalho, linhas }: { cabecalho: string[]; linhas: string[][] }) {
  return (
    <details className="group mt-2 type-body-small">
      <summary className="camada-estado -ml-3 flex min-h-11 w-fit cursor-pointer list-none items-center gap-1.5 rounded-full px-3 type-label-large text-on-surface-variant [&::-webkit-details-marker]:hidden">
        <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" aria-hidden />
        Ver tabela
      </summary>
      <table className="mt-1 w-full">
        <thead>
          <tr className="text-left type-label-medium text-on-surface-variant">
            {cabecalho.map((c, i) => (
              <th key={c} className={i ? "py-1.5 text-right font-medium" : "py-1.5 font-medium"}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l, i) => (
            <tr key={i} className="border-t border-outline-variant text-on-surface">
              {l.map((v, i) => (
                <td key={i} className={i ? "numero py-1.5 text-right" : "py-1.5"}>
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
  const idListras = `listras-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <div>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <pattern id={idListras} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="4" height="4" style={{ fill: COR.bruta }} />
            <rect width="1.5" height="4" style={{ fill: COR.efetiva }} />
          </pattern>
        </defs>
      </svg>
      <Legenda
        itens={[
          { cor: COR.efetiva, nome: "Horas efetivas" },
          { cor: COR.bruta, nome: "Horas brutas", listrada: true },
          ...(meta ? [{ cor: COR.mudo, nome: `Meta (${formatarHoras(meta)})`, linha: true }] : []),
        ]}
      />
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} barGap={2} barCategoryGap="20%" margin={{ top: 8, right: 4, bottom: 0, left: -12 }}>
            <CartesianGrid vertical={false} stroke={COR.grade} />
            <XAxis dataKey="rotulo" tick={EIXO_TEXTO} tickLine={false} axisLine={{ stroke: COR.eixo }} interval="preserveStartEnd" minTickGap={8} />
            <YAxis
              tick={EIXO}
              tickLine={false}
              axisLine={false}
              allowDecimals
              domain={[0, maximo > 0 ? "auto" : 1]}
              tickFormatter={(v: number) => NUM.format(v)}
            />
            <Tooltip
              cursor={{ fill: COR.cursor, opacity: 0.6 }}
              content={({ active, payload }) => {
                const p = active ? (payload?.[0]?.payload as PontoHoras | undefined) : undefined;
                if (!p) return null;
                return (
                  <CaixaTooltip
                    titulo={p.titulo}
                    linhas={[
                      { cor: COR.efetiva, nome: "Efetivas", valor: formatarHoras(p.efetivas) },
                      { cor: COR.bruta, nome: "Brutas", valor: formatarHoras(p.brutas), listrada: true },
                    ]}
                  />
                );
              }}
            />
            {meta ? <ReferenceLine y={meta} stroke={COR.mudo} strokeWidth={1.5} strokeDasharray="4 4" ifOverflow="extendDomain" /> : null}
            <Bar
              dataKey="brutas"
              name="Brutas"
              fill={`url(#${idListras})`}
              stroke={COR.efetiva}
              strokeWidth={1}
              radius={[4, 4, 0, 0]}
              maxBarSize={12}
              isAnimationActive={false}
            />
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
            <XAxis dataKey="rotulo" tick={EIXO_TEXTO} tickLine={false} axisLine={{ stroke: COR.eixo }} interval="preserveStartEnd" minTickGap={8} />
            <YAxis
              domain={dominio ?? ["auto", "auto"]}
              tick={EIXO}
              tickLine={false}
              axisLine={false}
              allowDecimals={!dominio}
              tickFormatter={(v: number) => NUM.format(v)}
              width={dominio ? 60 : 48}
            />
            {temMeta && <ReferenceLine y={meta} stroke={COR.mudo} strokeWidth={1.5} strokeDasharray="4 4" ifOverflow="extendDomain" />}
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

export type PontoRadar = { area: string; efetivas: number };

/** Distribuição de horas efetivas entre áreas (uma série; o título nomeia o período). */
export function GraficoRadar({ dados }: { dados: PontoRadar[] }) {
  return (
    <div>
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={dados} outerRadius="72%" margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
            <PolarGrid stroke={COR.grade} />
            <PolarAngleAxis dataKey="area" tick={EIXO_TEXTO} />
            <Tooltip
              content={({ active, payload }) => {
                const p = active ? (payload?.[0]?.payload as PontoRadar | undefined) : undefined;
                if (!p) return null;
                return <CaixaTooltip titulo={p.area} linhas={[{ cor: COR.efetiva, nome: "Efetivas", valor: formatarHoras(p.efetivas) }]} />;
              }}
            />
            <Radar
              dataKey="efetivas"
              stroke={COR.efetiva}
              strokeWidth={2}
              fill={COR.efetiva}
              fillOpacity={0.12}
              dot={{ r: 4, fill: COR.efetiva, stroke: COR.superficie, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <Tabela
        cabecalho={["Área", "Efetivas"]}
        linhas={[...dados].sort((a, b) => b.efetivas - a.efetivas).map((d) => [d.area, formatarHoras(d.efetivas)])}
      />
    </div>
  );
}
