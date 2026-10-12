import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/server";
import { ehUuid } from "@/lib/uuid";
import { SkillForm } from "../skill-form";

export const metadata: Metadata = { title: "Nova habilidade" };

export default async function NovaHabilidadePage({ searchParams }: PageProps<"/habilidades/nova">) {
  const { area } = await searchParams;
  const areaInicial = typeof area === "string" && ehUuid(area) ? area : undefined;

  const supabase = await createClient();
  const { data: areas } = await supabase
    .from("areas")
    .select("id, nome")
    .eq("arquivada", false)
    .order("ordem");

  const voltar = areaInicial
    ? { href: `/areas/${areaInicial}`, nome: areas?.find((a) => a.id === areaInicial)?.nome ?? "Área" }
    : { href: "/areas", nome: "Áreas" };

  if (!areas?.length) {
    return (
      <>
        <PageHeader titulo="Nova habilidade" voltar={voltar} />
        <p className="text-sm text-muted-foreground">
          Crie uma <Link href="/areas/nova" className="underline">área</Link> primeiro.
        </p>
      </>
    );
  }

  return (
    <>
      <PageHeader titulo="Nova habilidade" voltar={voltar} />
      <SkillForm areas={areas} areaInicial={areaInicial} cancelarHref={voltar.href} />
    </>
  );
}
