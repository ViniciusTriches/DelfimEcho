import Link from "next/link";
import { CheckIcon, MinusIcon, TargetIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { formatarDia, hojeSP } from "@/lib/datas";
import { type Direcao, formatarValor, situacaoMeta, tendencia } from "@/lib/metricas";
import type { MetricaComValores } from "./dados";
import { corArea } from "@/lib/cores-area";
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
    <li className="flex flex-col gap-4 rounded-lg bg-surface-container-low p-5">
      <Link href={`/metricas/${metrica.id}`} className="group -m-2 flex flex-col gap-1 rounded-md p-2 camada-estado">
        <span className="flex items-center gap-1.5 type-body-medium text-on-surface-variant">
          {mostrarArea && (
            <span className="size-2 rounded-full" style={{ backgroundColor: corArea(metrica.areas.cor) }} aria-hidden />
          )}
          <span className="type-title-small text-on-surface">{metrica.nome}</span>
          {mostrarArea && <span>· {metrica.areas.nome}</span>}
        </span>
        {ultimo ? (
          <>
            <span className="numero-grande type-headline-medium text-on-surface">{formatarValor(ultimo.valor, metrica.unidade)}</span>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 type-body-small text-on-surface-variant">
              <span>{formatarDia(ultimo.data)}</span>
              {t && (
                <span className="flex items-center gap-1">
                  <Seta
                    className={
                      t.melhorou === null
                        ? "size-3.5"
                        : t.melhorou
                          ? "size-3.5 text-concluido"
                          : "size-3.5 text-error"
                    }
                    aria-hidden
                  />
                  {t.delta > 0 ? "+" : ""}
                  <span className="numero">{formatarValor(t.delta, metrica.unidade)}</span>
                  {t.melhorou !== null && <span>({t.melhorou ? "melhorou" : "piorou"})</span>}
                </span>
              )}
              {meta && (
                <span className="flex items-center gap-1">
                  {meta.atingida ? (
                    <CheckIcon className="size-3.5 text-concluido" aria-hidden />
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
          <span className="type-body-medium text-on-surface-variant">Nenhum valor ainda.</span>
        )}
      </Link>
      <ValorForm metricId={metrica.id} nome={metrica.nome} unidade={metrica.unidade} hoje={hojeSP()} />
    </li>
  );
}
