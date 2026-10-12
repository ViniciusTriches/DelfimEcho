import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckIcon, PencilIcon, PlusCircleIcon, Trash2Icon } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { GraficoHoras, GraficoLinha } from "@/components/graficos";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  diasEntre,
  formatarDia,
  formatarDiaMes,
  formatarMesAno,
  hojeSP,
  inicioSemana,
  mesDe,
  somarDias,
} from "@/lib/datas";
import { formatarHoras } from "@/lib/formato";
import {
  DIAS_RITMO,
  estimativa,
  horasNoPeriodo,
  notaMedia,
  progressoNiveis,
  ritmoSemanal,
  type SessaoHoras,
  seriesMensais,
  seriesSemanais,
} from "@/lib/progresso";
import { createClient } from "@/lib/supabase/server";
import { NOMES_PERIODO, type Periodo } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { ehUuid } from "@/lib/uuid";
import { excluirAvaliacao } from "../actions";
import { AvaliacaoForm } from "./avaliacao-form";
import { SessoesHabilidade } from "./sessoes";

const SEMANAS_GRAFICO = 12;
const DIAS_REAVALIAR = 30;
const NUM = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

export async function generateMetadata({ params }: PageProps<"/habilidades/[id]">): Promise<Metadata> {
  const { id } = await params;
  if (!ehUuid(id)) return {};
  const supabase = await createClient();
  const { data } = await supabase.from("skills").select("nome").eq("id", id).maybeSingle();
  return { title: data?.nome ?? "Habilidade" };
}

export default async function HabilidadePage({ params, searchParams }: PageProps<"/habilidades/[id]">) {
  const { id } = await params;
  if (!ehUuid(id)) notFound();
  const todasSessoes = (await searchParams).sessoes === "todas";

  const supabase = await createClient();
  const [{ data: habilidade }, { data: niveis }, { data: metas }, { data: linhas }, { data: avaliacoes }] =
    await Promise.all([
      supabase.from("skills").select("*, areas(nome, cor)").eq("id", id).maybeSingle(),
      supabase.from("skill_levels").select("nome_nivel, horas_acumuladas_alvo").eq("skill_id", id).order("ordem"),
      supabase.from("periodic_targets").select("horas_alvo, periodo").eq("skill_id", id),
      supabase
        .from("practice_sessions_horas")
        .select("data_local, duracao_minutos, horas_brutas, horas_efetivas, nota_qualidade")
        .eq("skill_id", id),
      supabase.from("skill_assessments").select("*").eq("skill_id", id).order("data", { ascending: true }),
    ]);
  if (!habilidade) notFound();

  const hoje = hojeSP();
  const sessoes: SessaoHoras[] = (linhas ?? []).map((s) => ({
    data_local: s.data_local!,
    duracao_minutos: s.duracao_minutos!,
    horas_brutas: Number(s.horas_brutas),
    horas_efetivas: Number(s.horas_efetivas),
    nota_qualidade: s.nota_qualidade!,
  }));

  // Totais: horas antes do Echo contam como efetivas e brutas.
  const iniciais = Number(habilidade.horas_iniciais);
  const totalEfetivas = iniciais + sessoes.reduce((t, s) => t + s.horas_efetivas, 0);
  const totalBrutas = iniciais + sessoes.reduce((t, s) => t + s.horas_brutas, 0);
  const ultimos28 = horasNoPeriodo(sessoes, somarDias(hoje, -(DIAS_RITMO - 1)), hoje);
  const ritmo = ritmoSemanal(sessoes, hoje);
  const media = notaMedia(sessoes);
  const semanas = seriesSemanais(sessoes, hoje, SEMANAS_GRAFICO);

  const metaSemana = metas?.find((m) => m.periodo === "semana")?.horas_alvo;
  const metaMes = metas?.find((m) => m.periodo === "mes")?.horas_alvo;
  const tipo = habilidade.tipo_meta_tempo;

  const ultimaAvaliacao = avaliacoes?.at(-1);
  const reavaliar = !ultimaAvaliacao || diasEntre(ultimaAvaliacao.data, hoje) >= DIAS_REAVALIAR;

  return (
    <>
      <PageHeader
        titulo={habilidade.nome}
        descricao={habilidade.arquivada ? "Habilidade arquivada" : habilidade.descricao}
        voltar={{ href: `/areas/${habilidade.area_id}`, nome: habilidade.areas?.nome ?? "Área" }}
        acoes={
          <>
            {!habilidade.arquivada && (
              <Link href={`/registrar?habilidade=${id}`} className={buttonVariants()}>
                <PlusCircleIcon />
                Registrar sessão
              </Link>
            )}
            <Link href={`/habilidades/${id}/editar`} className={buttonVariants({ variant: "outline" })}>
              <PencilIcon />
              Editar
            </Link>
          </>
        }
      />

      {/* Números principais */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Numero rotulo="Horas efetivas no total" valor={formatarHoras(totalEfetivas)} detalhe={`${formatarHoras(totalBrutas)} brutas`} />
        <Numero
          rotulo="Últimas 4 semanas"
          valor={formatarHoras(ultimos28.efetivas)}
          detalhe={`${formatarHoras(ultimos28.brutas)} brutas · ${NUM.format(ritmo)} h/semana`}
        />
        <Numero rotulo="Sessões" valor={String(sessoes.length)} detalhe={iniciais > 0 ? `+ ${formatarHoras(iniciais)} antes do Echo` : undefined} />
        <Numero
          rotulo="Nota média"
          valor={media ? NUM.format(media) : "—"}
          detalhe={habilidade.nivel_atual_autoavaliado ? `autoavaliação ${habilidade.nivel_atual_autoavaliado}/10` : undefined}
        />
      </div>

      {/* Progresso */}
      {tipo === "niveis" && (
        <Secao titulo="Progresso por nível">
          <ProgressoNiveis
            niveis={(niveis ?? []).map((n) => ({ nome: n.nome_nivel, horas: n.horas_acumuladas_alvo }))}
            total={totalEfetivas}
            totalBrutas={totalBrutas}
            ritmo={ritmo}
            hoje={hoje}
            editarHref={`/habilidades/${id}/editar`}
          />
        </Secao>
      )}

      {tipo === "periodica" && (
        <Secao titulo="Meta periódica">
          <div className="grid gap-4 sm:grid-cols-2">
            {metaSemana ? (
              <ProgressoPeriodo
                titulo={`Semana de ${formatarDiaMes(inicioSemana(hoje))}`}
                feito={horasNoPeriodo(sessoes, inicioSemana(hoje), hoje)}
                meta={metaSemana}
                historico={semanas.slice(0, -1).map((s) => s.efetivas)}
                periodo="semana"
              />
            ) : null}
            {metaMes ? (
              <ProgressoPeriodo
                titulo={formatarMesAno(hoje)}
                feito={horasNoPeriodo(sessoes, `${mesDe(hoje)}-01`, hoje)}
                meta={metaMes}
                historico={seriesMensais(sessoes, hoje, 7).slice(0, -1).map((m) => m.efetivas)}
                periodo="mes"
              />
            ) : null}
          </div>
          {!metaSemana && !metaMes && (
            <p className="text-sm text-muted-foreground">
              Meta não definida. <Link href={`/habilidades/${id}/editar`} className="underline">Definir meta</Link>
            </p>
          )}
        </Secao>
      )}

      {/* Gráficos */}
      <Secao titulo="Horas por semana" descricao={`Últimas ${SEMANAS_GRAFICO} semanas (segunda a domingo)`}>
        <GraficoHoras
          dados={semanas.map((s) => ({
            rotulo: s.rotulo,
            titulo: `Semana de ${s.rotulo}`,
            efetivas: s.efetivas,
            brutas: s.brutas,
          }))}
          meta={metaSemana ?? undefined}
        />
      </Secao>

      {metaMes ? (
        <Secao titulo="Horas por mês" descricao="Últimos 6 meses">
          <GraficoHoras
            dados={seriesMensais(sessoes, hoje, 6).map((m) => ({
              rotulo: m.rotulo,
              titulo: formatarMesAno(`${m.mes}-01`),
              efetivas: m.efetivas,
              brutas: m.brutas,
            }))}
            meta={metaMes}
          />
        </Secao>
      ) : null}

      <Secao
        titulo="Qualidade média por semana"
        descricao="Nota de 1 a 5, ponderada pela duração das sessões"
      >
        {semanas.some((s) => s.notaMedia !== null) ? (
          <GraficoLinha
            dados={semanas.map((s) => ({ rotulo: s.rotulo, titulo: `Semana de ${s.rotulo}`, valor: s.notaMedia }))}
            dominio={[1, 5]}
            nome="Nota média"
          />
        ) : (
          <p className="text-sm text-muted-foreground">Sem sessões nas últimas {SEMANAS_GRAFICO} semanas.</p>
        )}
      </Secao>

      {/* Autoavaliação */}
      <Secao titulo="Autoavaliação" descricao="Como você avalia seu nível de 1 a 10, ao longo do tempo">
        {reavaliar && !habilidade.arquivada && (
          <p className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
            {ultimaAvaliacao
              ? `Sua última autoavaliação foi há ${diasEntre(ultimaAvaliacao.data, hoje)} dias. Hora de se reavaliar.`
              : "Você ainda não se autoavaliou nesta habilidade. Que tal registrar o ponto de partida?"}
          </p>
        )}
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div>
            {avaliacoes && avaliacoes.length >= 2 && (
              <GraficoLinha
                dados={avaliacoes.map((a) => ({ rotulo: formatarDiaMes(a.data), titulo: formatarDia(a.data), valor: a.nivel }))}
                dominio={[1, 10]}
                nome="Nível"
              />
            )}
            {avaliacoes?.length ? (
              <ul className="mt-3 flex flex-col divide-y rounded-xl border text-sm">
                {[...avaliacoes].reverse().map((a) => (
                  <li key={a.id} className="flex items-center gap-3 p-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
                      {a.nivel}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-muted-foreground">{formatarDia(a.data)}</p>
                      {a.observacao && <p>{a.observacao}</p>}
                    </div>
                    <ConfirmButton
                      acao={excluirAvaliacao.bind(null, a.id, id)}
                      confirmar="Excluir esta autoavaliação?"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Excluir autoavaliação"
                    >
                      <Trash2Icon />
                    </ConfirmButton>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma autoavaliação ainda.</p>
            )}
          </div>
          {!habilidade.arquivada && (
            <AvaliacaoForm skillId={id} hoje={hoje} nivelAtual={habilidade.nivel_atual_autoavaliado} />
          )}
        </div>
      </Secao>

      {/* Sessões e reflexões */}
      <Secao titulo="Sessões e reflexões" descricao="Para reler o que você aprendeu">
        <SessoesHabilidade skillId={id} todas={todasSessoes} />
      </Secao>
    </>
  );
}

function Secao({ titulo, descricao, children }: { titulo: string; descricao?: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold">{titulo}</h2>
      {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Numero({ rotulo, valor, detalhe }: { rotulo: string; valor: string; detalhe?: string }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <p className="text-xs text-muted-foreground">{rotulo}</p>
      <p className="mt-1 text-2xl font-semibold">{valor}</p>
      {detalhe && <p className="mt-0.5 text-xs text-muted-foreground">{detalhe}</p>}
    </div>
  );
}

function Barra({ fracao, className }: { fracao: number; className?: string }) {
  return (
    <div className={cn("h-2.5 overflow-hidden rounded-full bg-[var(--viz-bruta)]/35", className)}>
      <div
        className="h-full rounded-full bg-[var(--viz-efetiva)]"
        style={{ width: `${Math.min(100, Math.max(0, fracao * 100))}%` }}
      />
    </div>
  );
}

function ProgressoNiveis({
  niveis,
  total,
  totalBrutas,
  ritmo,
  hoje,
  editarHref,
}: {
  niveis: { nome: string; horas: number }[];
  total: number;
  totalBrutas: number;
  ritmo: number;
  hoje: string;
  editarHref: string;
}) {
  if (!niveis.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Níveis não definidos. <Link href={editarHref} className="underline">Definir níveis</Link>
      </p>
    );
  }

  const p = progressoNiveis(niveis, total);
  const prev = p.proximo ? estimativa(p.faltam, ritmo, hoje) : null;

  return (
    <div className="flex flex-col gap-5">
      {p.proximo ? (
        <div className="rounded-xl border p-4">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm">
              {p.atual ? (
                <>
                  Nível atual: <strong>{p.atual.nome}</strong> · próximo:{" "}
                </>
              ) : (
                "Rumo a "
              )}
              <strong>{p.proximo.nome}</strong>
            </p>
            <p className="text-sm tabular-nums">
              <strong>{formatarHoras(total)}</strong>
              <span className="text-muted-foreground"> de {formatarHoras(p.proximo.horas)} efetivas</span>
            </p>
          </div>
          <Barra fracao={p.fracao} />
          <p className="mt-2 text-xs text-muted-foreground">
            {formatarHoras(totalBrutas)} brutas · faltam {formatarHoras(p.faltam)} efetivas
          </p>
          <p className="mt-3 text-sm">
            {prev ? (
              <>
                No ritmo das últimas 4 semanas ({NUM.format(ritmo)} h efetivas/semana), você chega a{" "}
                <strong>{p.proximo.nome}</strong> por volta de <strong>{formatarMesAno(prev.data)}</strong>{" "}
                <span className="text-muted-foreground">
                  (~{prev.semanas < 1 ? "menos de 1 semana" : `${Math.ceil(prev.semanas)} semanas`})
                </span>
                .
              </>
            ) : (
              <span className="text-muted-foreground">
                Sem prática nas últimas 4 semanas, então não dá para estimar a chegada.
              </span>
            )}
          </p>
        </div>
      ) : (
        <p className="rounded-xl border p-4 text-sm">
          Você passou do último nível (<strong>{p.atual?.nome}</strong>) com {formatarHoras(total)} efetivas.
        </p>
      )}

      <ol className="flex flex-col gap-1.5">
        {p.niveis.map((n) => {
          const atingido = total >= n.horas;
          const eProximo = p.proximo?.nome === n.nome;
          return (
            <li key={n.nome} className={cn("flex items-center gap-3 text-sm", !atingido && !eProximo && "text-muted-foreground")}>
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border",
                  atingido && "border-[var(--viz-efetiva)] bg-[var(--viz-efetiva)] text-white",
                  eProximo && "border-[var(--viz-efetiva)]",
                )}
              >
                {atingido && <CheckIcon className="size-3" aria-label="atingido" />}
              </span>
              <span className={cn("flex-1", eProximo && "font-medium")}>{n.nome}</span>
              <span className="tabular-nums">{formatarHoras(n.horas)}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ProgressoPeriodo({
  titulo,
  feito,
  meta,
  historico,
  periodo,
}: {
  titulo: string;
  feito: { efetivas: number; brutas: number };
  meta: number;
  historico: number[];
  periodo: Periodo;
}) {
  const batidas = historico.filter((h) => h >= meta).length;
  const atingiu = feito.efetivas >= meta;
  return (
    <div className="rounded-xl border p-4">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium first-letter:uppercase">{titulo}</p>
        {atingiu && (
          <Badge variant="secondary" className="gap-1">
            <CheckIcon className="size-3 text-[var(--viz-bom)]" aria-hidden />
            Meta batida
          </Badge>
        )}
      </div>
      <p className="mb-2 text-sm tabular-nums">
        <strong>{formatarHoras(feito.efetivas)}</strong>
        <span className="text-muted-foreground">
          {" "}
          de {formatarHoras(meta)}/{NOMES_PERIODO[periodo]} · {formatarHoras(feito.brutas)} brutas
        </span>
      </p>
      <Barra fracao={feito.efetivas / meta} />
      <p className="mt-3 text-xs text-muted-foreground">
        Meta batida em {batidas} de {historico.length} {periodo === "semana" ? "semanas" : "meses"} anteriores.
      </p>
    </div>
  );
}
