import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { AreaForm } from "../area-form";

export const metadata: Metadata = { title: "Nova área" };

export default function NovaAreaPage() {
  return (
    <>
      <PageHeader titulo="Nova área" voltar={{ href: "/areas", nome: "Áreas" }} />
      <AreaForm cancelarHref="/areas" />
    </>
  );
}
