import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { hojeSP } from "@/lib/datas";
import { DIA_VALIDO } from "@/lib/form";
import { carregarOpcoes, parametroUuid } from "@/lib/opcoes";
import { MarcoForm } from "../marco-form";

export const metadata: Metadata = { title: "Novo marco" };

export default async function NovoMarcoPage({ searchParams }: PageProps<"/marcos/novo">) {
  const params = await searchParams;
  const area = parametroUuid(params.area);
  const hoje = hojeSP();
  const data = typeof params.data === "string" && DIA_VALIDO.test(params.data) && params.data <= hoje ? params.data : undefined;
  const titulo = typeof params.titulo === "string" ? params.titulo.slice(0, 120) : undefined;
  const { areas, skills } = await carregarOpcoes();
  const voltar = area && !titulo ? `/areas/${area}` : "/marcos";

  return (
    <>
      <PageHeader titulo="Novo marco" voltar={{ href: voltar, nome: voltar === "/marcos" ? "Marcos" : "Área" }} />
      {areas.length ? (
        <MarcoForm
          areas={areas}
          skills={skills}
          inicial={{ titulo, area, skill: parametroUuid(params.habilidade), data }}
          hoje={hoje}
          voltar={voltar}
        />
      ) : (
        <p className="type-body-medium text-on-surface-variant">
          Crie uma <Link href="/areas/nova" className="underline">área</Link> primeiro.
        </p>
      )}
    </>
  );
}
