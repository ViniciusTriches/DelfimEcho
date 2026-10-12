import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { FATOR_PASSIVO_PADRAO } from "@/lib/pratica";
import { createClient } from "@/lib/supabase/server";
import { DIAS_ALERTA_PADRAO } from "@/lib/painel";
import { AlertaForm } from "./alerta-form";
import { FatoresForm } from "./fatores-form";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const [{ data: fatores }, { data: config }] = await Promise.all([
    supabase.from("quality_factors").select("nota, fator, descricao").order("nota", { ascending: false }),
    supabase.from("user_settings").select("fator_pratica_passiva, dias_alerta_abandono").maybeSingle(),
  ]);

  return (
    <>
      <PageHeader titulo="Configurações" voltar={{ href: "/mais", nome: "Mais" }} />
      <div className="flex max-w-xl flex-col gap-12">
        <section>
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

        <section>
          <h2 className="text-lg font-semibold">Alerta de abandono</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Habilidades ativas sem sessão aparecem em destaque no início, com atalho para registrar.
          </p>
          <AlertaForm dias={config?.dias_alerta_abandono ?? DIAS_ALERTA_PADRAO} />
        </section>
      </div>
    </>
  );
}
