import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { carregarOpcoes, parametroUuid } from "@/lib/opcoes";
import { MetaForm } from "../meta-form";

export const metadata: Metadata = { title: "Nova meta" };

export default async function NovaMetaPage({ searchParams }: PageProps<"/metas/nova">) {
  const params = await searchParams;
  const area = parametroUuid(params.area);
  const skill = parametroUuid(params.habilidade);
  const { areas, skills } = await carregarOpcoes();
  const voltar = area ? `/areas/${area}` : "/metas";

  return (
    <>
      <PageHeader titulo="Nova meta" voltar={{ href: voltar, nome: area ? "Área" : "Metas" }} />
      {areas.length ? (
        <MetaForm areas={areas} skills={skills} areaInicial={area} skillInicial={skill} voltar={voltar} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Crie uma <Link href="/areas/nova" className="underline">área</Link> primeiro.
        </p>
      )}
    </>
  );
}
