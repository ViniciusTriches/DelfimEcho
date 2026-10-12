import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { FiltroAreas } from "@/components/filtro-areas";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { carregarOpcoes, parametroUuid } from "@/lib/opcoes";
import { createClient } from "@/lib/supabase/server";
import { LinhaDoTempo } from "./linha-do-tempo";

export const metadata: Metadata = { title: "Marcos" };

export default async function MarcosPage({ searchParams }: PageProps<"/marcos">) {
  const area = parametroUuid((await searchParams).area);

  const supabase = await createClient();
  let consulta = supabase
    .from("milestones")
    .select("id, titulo, descricao, data, areas(nome, cor), skills(nome)")
    .order("data", { ascending: false });
  if (area) consulta = consulta.eq("area_id", area);
  const [{ data: marcos }, { areas }] = await Promise.all([consulta, carregarOpcoes()]);

  return (
    <>
      <PageHeader
        titulo="Marcos"
        descricao="Conquistas que mostram onde você chegou."
        acoes={
          <Link href={area ? `/marcos/novo?area=${area}` : "/marcos/novo"} className={buttonVariants()}>
            <PlusIcon />
            Novo marco
          </Link>
        }
      />
      <FiltroAreas areas={areas} atual={area} href={(a) => (a ? `/marcos?area=${a}` : "/marcos")} />
      {marcos?.length ? (
        <LinhaDoTempo marcos={marcos} mostrarArea={!area} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Nenhum marco ainda. Registre a primeira conquista, ou use &quot;Virar marco&quot; numa meta concluída.
        </p>
      )}
    </>
  );
}
