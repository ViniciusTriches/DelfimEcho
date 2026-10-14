import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { formatarMesAno, hojeSP, mesDe, somarMeses } from "@/lib/datas";
import { mesParaRevisar, periodoMes } from "@/lib/revisoes";
import { createClient } from "@/lib/supabase/server";
import { carregarResumo } from "../dados";
import { NavegacaoPeriodo } from "../navegacao-periodo";
import { ResumoRevisao } from "../resumo";
import { RevisaoForm } from "../revisao-form";

export const metadata: Metadata = { title: "Revisão mensal" };

export default async function RevisaoMensalPage({ searchParams }: PageProps<"/revisoes/mensal">) {
  const params = await searchParams;
  await createClient(); // sessão antes da hora atual (página dinâmica)
  const hoje = hojeSP();
  const atual = mesDe(hoje);
  const pedido = typeof params.mes === "string" && /^\d{4}-\d{2}$/.test(params.mes) ? params.mes : null;
  const mes = pedido && pedido <= atual ? pedido : mesParaRevisar(hoje);
  const periodo = periodoMes(mes);
  const r = await carregarResumo("mensal", periodo);

  return (
    <>
      <PageHeader titulo="Revisão mensal" voltar={{ href: "/revisoes", nome: "Revisões" }} />
      <NavegacaoPeriodo
        rotulo={formatarMesAno(periodo.desde)}
        detalhe={periodo.ate > hoje ? "Mês em andamento" : r.revisao ? "Revisão feita" : undefined}
        anterior={`/revisoes/mensal?mes=${somarMeses(mes, -1)}`}
        seguinte={mes < atual ? `/revisoes/mensal?mes=${somarMeses(mes, 1)}` : null}
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <ResumoRevisao tipo="mensal" r={r} />
        <section aria-labelledby="titulo-perguntas" className="lg:sticky lg:top-20 lg:self-start">
          <h2 id="titulo-perguntas" className="mb-3 type-title-large">
            Sua revisão
          </h2>
          <RevisaoForm key={mes} tipo="mensal" periodoInicio={periodo.desde} revisao={r.revisao} />
        </section>
      </div>
    </>
  );
}
