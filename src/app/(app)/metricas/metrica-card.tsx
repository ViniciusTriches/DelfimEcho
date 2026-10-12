import Link from "next/link";
import { CheckIcon, MinusIcon, TargetIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { formatarDia, hojeSP } from "@/lib/datas";
import { type Direcao, formatarValor, situacaoMeta, tendencia } from "@/lib/metricas";
import type { MetricaComValores } from "./dados";
import { ValorForm } from "./valor-form";

/** Último valor, variação desde o anterior (com sentido bom/ruim) e situação da meta + registro rápido. */
export function MetricaCard({ metrica, mostrarArea = true }: { metrica: MetricaComValores; mostrarArea?: boolean }) {
  const direcao = metrica.direcao as Direcao;
  const ultimo = metrica.valores.at(-1);
  const anterior = metrica.valores.at(-2);
  const t = ultimo ? tendencia(ultimo.valor, anterior?.valor, direcao) : null;
  const meta = ultimo ? situacaoMeta(ultimo.valor, metrica.meta_valor, direcao) : null;
  const Seta = !t || t.delta === 0 ? MinusIcon : t.delta > 0 ? TrendingUpIcon : TrendingDownIcon;

  return (
    <li className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <Link href={`/metricas/${metrica.id}`} className="group flex cursor-pointer flex-col gap-1">
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {mostrarArea && (
            <span className="size-2 rounded-full" style={{ backgroundColor: metrica.areas.cor }} aria-hidden />
          )}
          <span className="font-medium text-foreground group-hover:text-primary">{metrica.nome}</span>
          {mostrarArea && <span>· {metrica.areas.nome}</span>}
        </span>
        {ultimo ? (
          <>
            <span className="text-2xl font-semibold">{formatarValor(ultimo.valor, metrica.unidade)}</span>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{formatarDia(ultimo.data)}</span>
              {t && (
                <span className="flex items-center gap-1">
                  <Seta
                    className={
                      t.melhorou === null
                        ? "size-3.5"
                        : t.melhorou
                          ? "size-3.5 text-[var(--concluido)]"
                          : "size-3.5 text-destructive"
                    }
                    aria-hidden
                  />
                  {t.delta > 0 ? "+" : ""}
                  {formatarValor(t.delta, metrica.unidade)}
                  {t.melhorou !== null && <span>({t.melhorou ? "melhorou" : "piorou"})</span>}
                </span>
              )}
              {meta && (
                <span className="flex items-center gap-1">
                  {meta.atingida ? (
                    <CheckIcon className="size-3.5 text-[var(--concluido)]" aria-hidden />
                  ) : (
                    <TargetIcon className="size-3.5" aria-hidden />
                  )}
                  {meta.atingida
                    ? "Meta atingida"
                    : `Faltam ${formatarValor(meta.falta, metrica.unidade)} para ${formatarValor(metrica.meta_valor!, metrica.unidade)}`}
                </span>
              )}
            </span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Nenhum valor ainda.</span>
        )}
      </Link>
      <ValorForm metricId={metrica.id} nome={metrica.nome} unidade={metrica.unidade} hoje={hojeSP()} />
    </li>
  );
}
