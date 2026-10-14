import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckIcon, PencilIcon, PlusCircleIcon, Trash2Icon, RefreshCwIcon } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { Bloco } from "@/components/esqueleto";
import { GraficoHoras, GraficoLinha } from "@/components/graficos";
import { PageHeader } from "@/components/page-header";
import { Horas } from "@/components/horas";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Progresso } from "@/components/ui/progresso";
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
import { todasAsLinhas } from "@/lib/supabase/paginar";
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
  const [{ data: habilidade }, { data: niveis }, { data: metas }, linhas, { data: avaliacoes }] =
    await Promise.all([
      supabase.from("skills").select("*, areas(nome, cor)").eq("id", id).maybeSingle(),
      supabase.from("skill_levels").select("nome_nivel, horas_acumuladas_alvo").eq("skill_id", id).order("ordem"),
      supabase.from("periodic_targets").select("horas_alvo, periodo").eq("skill_id", id),
      todasAsLinhas((de, ate) =>
        supabase
          .from("practice_sessions_horas")
          .select("data_local, duracao_minutos, horas_brutas, horas_efetivas, nota_qualidade")
          .eq("skill_id", id)
          .order("inicio")
          .order("id")
          .range(de, ate),
      ),
      supabase.from("skill_assessments").select("*").eq("skill_id", id).order("data", { ascending: true }),
    ]);
  if (!habilidade) notFound();

  const hoje = hojeSP();
  const sessoes: SessaoHoras[] = linhas.map((s) => ({
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
      <div className="mb-12 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Numero rotulo="Horas efetivas no total" valor={<Horas valor={totalEfetivas} grande />} detalhe={`${formatarHoras(totalBrutas)} brutas`} />
        <Numero
          rotulo="Últimas 4 semanas"
          valor={<Horas valor={ultimos28.efetivas} grande />}
          detalhe={`${formatarHoras(ultimos28.brutas)} brutas · ${NUM.format(ritmo)} h/semana`}
        />
        <Numero rotulo="Sessões" valor={<span className="numero-grande">{sessoes.length}</span>} detalhe={iniciais > 0 ? `+ ${formatarHoras(iniciais)} antes do Echo` : undefined} />
        <Numero
          rotulo="Nota média"
          valor={<span className="numero-grande">{media ? NUM.format(media) : "—"}</span>}
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
            <p className="type-body-medium text-on-surface-variant">
              Meta não definida. <Link href={`/habilidades/${id}/editar`} className="underline">Definir meta</Link>
            </p>
          )}
        </Secao>
      )}

      {/* Gráficos */}
      <Secao titulo="Horas por semana" descricao={`Últimas ${SEMANAS_GRAFICO} semanas (segunda a domingo)`} cartao>
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
        <Secao titulo="Horas por mês" descricao="Últimos 6 meses" cartao>
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
        cartao
      >
        {semanas.some((s) => s.notaMedia !== null) ? (
          <GraficoLinha
            dados={semanas.map((s) => ({ rotulo: s.rotulo, titulo: `Semana de ${s.rotulo}`, valor: s.notaMedia }))}
            dominio={[1, 5]}
            nome="Nota média"
          />
        ) : (
          <p className="type-body-medium text-on-surface-variant">Sem sessões nas últimas {SEMANAS_GRAFICO} semanas.</p>
        )}
      </Secao>

      {/* Autoavaliação */}
      <Secao titulo="Autoavaliação" descricao="Como você avalia seu nível de 1 a 10, ao longo do tempo">
        {reavaliar && !habilidade.arquivada && (
          <p className="mb-5 flex items-start gap-3 rounded-lg bg-secondary-container px-4 py-3 type-body-medium text-on-secondary-container">
            <RefreshCwIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            {ultimaAvaliacao
              ? `Sua última autoavaliação foi há ${diasEntre(ultimaAvaliacao.data, hoje)} dias. Hora de se reavaliar.`
              : "Você ainda não se autoavaliou nesta habilidade. Que tal registrar o ponto de partida?"}
          </p>
        )}
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
          <div>
            {avaliacoes && avaliacoes.length >= 2 && (
              <div className="rounded-lg bg-surface-container-low p-5">
                <GraficoLinha
                  dados={avaliacoes.map((a) => ({ rotulo: formatarDiaMes(a.data), titulo: formatarDia(a.data), valor: a.nivel }))}
                  dominio={[1, 10]}
                  nome="Nível"
                />
              </div>
            )}
            {avaliacoes?.length ? (
              <ul className="mt-3 flex flex-col divide-y divide-outline-variant overflow-hidden rounded-lg bg-surface-container-low type-body-medium">
                {[...avaliacoes].reverse().map((a) => (
                  <li key={a.id} className="flex items-center gap-4 py-3 pr-2 pl-4">
                    <span className="numero flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary-container type-title-medium text-on-secondary-container">
                      {a.nivel}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="type-label-medium text-on-surface-variant">{formatarDia(a.data)}</p>
                      {a.observacao && <p className="text-on-surface">{a.observacao}</p>}
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
              <p className="rounded-lg border border-dashed border-outline-variant px-4 py-5 type-body-medium text-on-surface-variant">Nenhuma autoavaliação ainda.</p>
            )}
          </div>
          {!habilidade.arquivada && (
            <div className="rounded-lg bg-surface-container-low p-5 lg:self-start">
              <h3 className="mb-4 type-title-medium text-on-surface">Nova autoavaliação</h3>
              <AvaliacaoForm skillId={id} hoje={hoje} nivelAtual={habilidade.nivel_atual_autoavaliado} />
            </div>
          )}
        </div>
      </Secao>

      {/* Sessões e reflexões */}
      <Secao titulo="Sessões e reflexões" descricao="Para reler o que você aprendeu">
        <Suspense fallback={<Bloco className="h-40 rounded-lg" />}>
          <SessoesHabilidade skillId={id} todas={todasSessoes} />
        </Suspense>
      </Secao>
    </>
  );
}

function Secao({
  titulo,
  descricao,
  cartao = false,
  children,
}: {
  titulo: string;
  descricao?: string;
  cartao?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="type-title-large text-on-surface">{titulo}</h2>
      {descricao && <p className="mt-0.5 type-body-medium text-on-surface-variant">{descricao}</p>}
      <div className={cn("mt-4", cartao && "rounded-lg bg-surface-container-low p-5")}>{children}</div>
    </section>
  );
}

function Numero({ rotulo, valor, detalhe }: { rotulo: string; valor: React.ReactNode; detalhe?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-surface-container-low p-4">
      <p className="type-label-medium text-on-surface-variant">{rotulo}</p>
      <p className="type-headline-small text-on-surface">{valor}</p>
      {detalhe && <p className="type-body-small text-on-surface-variant">{detalhe}</p>}
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
      <p className="type-body-medium text-on-surface-variant">
        Níveis não definidos.{" "}
        <Link href={editarHref} className="text-primary underline">
          Definir níveis
        </Link>
      </p>
    );
  }

  const p = progressoNiveis(niveis, total);
  const prev = p.proximo ? estimativa(p.faltam, ritmo, hoje) : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      {p.proximo ? (
        <div className="flex flex-col gap-4 rounded-lg bg-surface-container-low p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="type-title-medium text-on-surface">
              {p.atual ? `${p.atual.nome} → ` : "Rumo a "}
              {p.proximo.nome}
            </p>
            <p className="type-body-medium text-on-surface-variant">
              <span className="type-title-medium text-on-surface">
                <Horas valor={total} />
              </span>{" "}
              de <Horas valor={p.proximo.horas} /> efetivas
            </p>
          </div>
          <Progresso
            fracao={p.fracao}
            rotulo={`${formatarHoras(total)} de ${formatarHoras(p.proximo.horas)} até ${p.proximo.nome}`}
          />
          <p className="type-body-small text-on-surface-variant">
            {formatarHoras(totalBrutas)} brutas · faltam {formatarHoras(p.faltam)} efetivas
          </p>
          <p className="type-body-medium text-on-surface">
            {prev ? (
              <>
                No ritmo das últimas 4 semanas ({NUM.format(ritmo)} h efetivas/semana), você chega a {p.proximo.nome}{" "}
                por volta de <strong className="font-medium">{formatarMesAno(prev.data)}</strong>{" "}
                <span className="text-on-surface-variant">
                  (~{prev.semanas < 1 ? "menos de 1 semana" : `${Math.ceil(prev.semanas)} semanas`})
                </span>
                .
              </>
            ) : (
              <span className="text-on-surface-variant">
                Sem prática nas últimas 4 semanas, então não dá para estimar a chegada.
              </span>
            )}
          </p>
        </div>
      ) : (
        <p className="rounded-lg bg-surface-container-low p-5 type-body-large text-on-surface">
          Você passou do último nível ({p.atual?.nome}) com <Horas valor={total} /> efetivas.
        </p>
      )}

      <ol className="flex flex-col overflow-hidden rounded-lg bg-surface-container-low py-2">
        {p.niveis.map((n) => {
          const atingido = total >= n.horas;
          const eProximo = p.proximo?.nome === n.nome;
          return (
            <li
              key={n.nome}
              className={cn(
                "flex min-h-11 items-center gap-3 px-4 type-body-medium",
                eProximo
                  ? "bg-secondary-container text-on-secondary-container"
                  : atingido
                    ? "text-on-surface"
                    : "text-on-surface-variant",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                  atingido
                    ? "border-primary bg-primary text-on-primary"
                    : eProximo
                      ? "border-on-secondary-container"
                      : "border-outline",
                )}
              >
                {atingido && <CheckIcon className="size-3.5" strokeWidth={3} aria-label="atingido" />}
              </span>
              <span className={cn("flex-1", eProximo && "font-medium")}>{n.nome}</span>
              <Horas valor={n.horas} />
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
    <div className="flex flex-col gap-3 rounded-lg bg-surface-container-low p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="type-title-medium text-on-surface first-letter:uppercase">{titulo}</p>
        {atingiu && (
          <Badge variant="secondary" className="gap-1">
            <CheckIcon className="size-3.5" aria-hidden />
            Meta batida
          </Badge>
        )}
      </div>
      <p className="type-body-medium text-on-surface-variant">
        <span className="type-title-large text-on-surface">
          <Horas valor={feito.efetivas} />
        </span>{" "}
        de <Horas valor={meta} />/{NOMES_PERIODO[periodo]} · {formatarHoras(feito.brutas)} brutas
      </p>
      <Progresso fracao={feito.efetivas / meta} rotulo={`${formatarHoras(feito.efetivas)} de ${formatarHoras(meta)}`} />
      <p className="type-body-small text-on-surface-variant">
        Meta batida em {batidas} de {historico.length} {periodo === "semana" ? "semanas" : "meses"} anteriores.
      </p>
    </div>
  );
}
