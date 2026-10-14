import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Bloco } from "@/components/esqueleto";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { LinhaDoTempo } from "../../marcos/linha-do-tempo";
import { MetaCard } from "../../metas/meta-card";
import { carregarMetricas } from "../../metricas/dados";
import { MetricaCard } from "../../metricas/metrica-card";

const QTD_MARCOS = 3;

/** Metas ativas, métricas e marcos recentes de uma área. */
export async function SecoesDaArea({ areaId }: { areaId: string }) {
  const supabase = await createClient();
  const [{ data: metas }, metricas, { data: marcos, count: totalMarcos }] = await Promise.all([
    supabase
      .from("goals")
      .select("*, areas(nome, cor), skills(nome)")
      .eq("area_id", areaId)
      .eq("status", "ativa")
      .order("prazo", { ascending: true, nullsFirst: false }),
    carregarMetricas({ areaId }),
    supabase
      .from("milestones")
      .select("id, titulo, descricao, data, areas(nome, cor), skills(nome)", { count: "exact" })
      .eq("area_id", areaId)
      .order("data", { ascending: false })
      .limit(QTD_MARCOS),
  ]);

  return (
    <>
      <Secao
        titulo="Metas ativas"
        novo={`/metas/nova?area=${areaId}`}
        novoNome="Nova meta"
        todos={`/metas?area=${areaId}`}
        vazio="Nenhuma meta ativa nesta área."
        temItens={Boolean(metas?.length)}
      >
        <ul className="flex flex-col gap-3">
          {metas?.map((m) => (
            <MetaCard key={m.id} meta={m} mostrarArea={false} />
          ))}
        </ul>
      </Secao>

      <Secao
        titulo="Métricas"
        novo={`/metricas/nova?area=${areaId}`}
        novoNome="Nova métrica"
        vazio="Nenhuma métrica nesta área."
        temItens={metricas.length > 0}
      >
        <ul className="grid gap-3 sm:grid-cols-2">
          {metricas.map((m) => (
            <MetricaCard key={m.id} metrica={m} mostrarArea={false} />
          ))}
        </ul>
      </Secao>

      <Secao
        titulo="Marcos"
        novo={`/marcos/novo?area=${areaId}`}
        novoNome="Novo marco"
        todos={(totalMarcos ?? 0) > QTD_MARCOS ? `/marcos?area=${areaId}` : undefined}
        vazio="Nenhum marco nesta área ainda."
        temItens={Boolean(marcos?.length)}
      >
        <LinhaDoTempo marcos={marcos ?? []} mostrarArea={false} />
      </Secao>
    </>
  );
}

function Secao({
  titulo,
  novo,
  novoNome,
  todos,
  vazio,
  temItens,
  children,
}: {
  titulo: string;
  novo: string;
  novoNome: string;
  todos?: string;
  vazio: string;
  temItens: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{titulo}</h2>
        <div className="flex items-center gap-2">
          {todos && (
            <Link href={todos} className={buttonVariants({ variant: "ghost", size: "sm", className: "min-h-11 sm:min-h-7" })}>
              Ver todos
            </Link>
          )}
          <Link href={novo} className={buttonVariants({ variant: "outline", size: "sm", className: "min-h-11 sm:min-h-7" })}>
            <PlusIcon />
            {novoNome}
          </Link>
        </div>
      </div>
      {temItens ? children : <p className="text-sm text-muted-foreground">{vazio}</p>}
    </section>
  );
}

/** Enquanto metas, métricas e marcos chegam (o resto da área já aparece). */
export function SecoesCarregando() {
  return (
    <div className="mt-10 flex flex-col gap-3" aria-busy="true">
      <Bloco className="h-6 w-36" />
      <Bloco className="h-24 rounded-lg" />
      <Bloco className="h-24 rounded-lg" />
    </div>
  );
}
