import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { formatarDiaMes, hojeSP, inicioSemana, somarDias } from "@/lib/datas";
import { DIA_VALIDO } from "@/lib/form";
import { periodoSemana, semanaParaPlanejar, semanaParaRevisar } from "@/lib/revisoes";
import { createClient } from "@/lib/supabase/server";
import { carregarResumo } from "../dados";
import { NavegacaoPeriodo } from "../navegacao-periodo";
import { ResumoRevisao } from "../resumo";
import { RevisaoForm } from "../revisao-form";

export const metadata: Metadata = { title: "Revisão semanal" };

export default async function RevisaoSemanalPage({ searchParams }: PageProps<"/revisoes/semanal">) {
  const params = await searchParams;
  await createClient(); // sessão antes da hora atual (página dinâmica)
  const hoje = hojeSP();
  const atual = inicioSemana(hoje);
  const pedida = typeof params.semana === "string" && DIA_VALIDO.test(params.semana) ? inicioSemana(params.semana) : null;
  const semana = pedida && pedida <= atual ? pedida : semanaParaRevisar(hoje);
  const periodo = periodoSemana(semana);
  const r = await carregarResumo("semanal", periodo);

  const emAndamento = periodo.ate > hoje;
  const planejar = semanaParaPlanejar(semana, hoje);

  return (
    <>
      <PageHeader titulo="Revisão semanal" voltar={{ href: "/revisoes", nome: "Revisões" }} />
      <NavegacaoPeriodo
        rotulo={`Semana de ${formatarDiaMes(periodo.desde)} a ${formatarDiaMes(periodo.ate)}`}
        detalhe={emAndamento ? "Semana em andamento" : r.revisao ? "Revisão feita" : undefined}
        anterior={`/revisoes/semanal?semana=${somarDias(semana, -7)}`}
        seguinte={semana < atual ? `/revisoes/semanal?semana=${somarDias(semana, 7)}` : null}
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <ResumoRevisao tipo="semanal" r={r} />
        <section aria-labelledby="titulo-perguntas" className="lg:sticky lg:top-20 lg:self-start">
          <h2 id="titulo-perguntas" className="mb-3 type-title-large">
            Sua revisão
          </h2>
          <RevisaoForm
            key={semana}
            tipo="semanal"
            periodoInicio={semana}
            revisao={r.revisao}
            planejarHref={`/plano?semana=${planejar}&base=${semana}`}
          />
        </section>
      </div>
    </>
  );
}
