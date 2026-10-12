import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { hojeSP } from "@/lib/datas";
import { createClient } from "@/lib/supabase/server";
import { HabitoForm } from "../habito-form";

export const metadata: Metadata = { title: "Novo hábito" };

export default async function NovoHabitoPage() {
  const supabase = await createClient();
  const { data: areas } = await supabase.from("areas").select("id, nome").eq("arquivada", false).order("ordem");
  return (
    <>
      <PageHeader titulo="Novo hábito" voltar={{ href: "/habitos/gerenciar", nome: "Gerenciar hábitos" }} />
      <HabitoForm areas={areas ?? []} hoje={hojeSP()} />
    </>
  );
}
