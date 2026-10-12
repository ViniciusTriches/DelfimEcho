import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { FATOR_PASSIVO_PADRAO } from "@/lib/pratica";
import { createClient } from "@/lib/supabase/server";
import { FatoresForm } from "./fatores-form";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const [{ data: fatores }, { data: config }] = await Promise.all([
    supabase.from("quality_factors").select("nota, fator, descricao").order("nota", { ascending: false }),
    supabase.from("user_settings").select("fator_pratica_passiva").maybeSingle(),
  ]);

  return (
    <>
      <PageHeader titulo="Configurações" />
      <section className="max-w-xl">
        <h2 className="text-lg font-semibold">Horas efetivas</h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Horas efetivas = duração × fator da nota de qualidade × fator da prática passiva (só em
          sessões passivas). Mudar um fator recalcula todas as sessões, inclusive as antigas.
        </p>
        <FatoresForm
          fatores={(fatores ?? []).map((f) => ({ ...f, fator: Number(f.fator) }))}
          fatorPassivo={Number(config?.fator_pratica_passiva ?? FATOR_PASSIVO_PADRAO)}
        />
      </section>
    </>
  );
}
