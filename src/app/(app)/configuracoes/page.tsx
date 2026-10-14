import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { FATOR_PASSIVO_PADRAO } from "@/lib/pratica";
import { createClient } from "@/lib/supabase/server";
import { DIAS_ALERTA_PADRAO } from "@/lib/painel";
import { HORA_FIM_PADRAO, HORA_INICIO_PADRAO } from "@/lib/calendario";
import { AlertaForm } from "./alerta-form";
import { CalendarioForm } from "./calendario-form";
import { FatoresForm } from "./fatores-form";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const [{ data: fatores }, { data: config }] = await Promise.all([
    supabase.from("quality_factors").select("nota, fator, descricao").order("nota", { ascending: false }),
    supabase.from("user_settings").select("fator_pratica_passiva, dias_alerta_abandono, calendario_hora_inicio, calendario_hora_fim").maybeSingle(),
  ]);

  return (
    <>
      <PageHeader titulo="Configurações" voltar={{ href: "/mais", nome: "Mais" }} />
      <div className="flex max-w-xl flex-col gap-6">
        <section className="rounded-lg bg-surface-container-low p-5 sm:p-6">
          <h2 className="type-title-large text-on-surface">Horas efetivas</h2>
          <p className="mt-1 mb-4 type-body-medium text-on-surface-variant">
            Horas efetivas = duração × fator da nota de qualidade × fator da prática passiva (só em
            sessões passivas). Mudar um fator recalcula todas as sessões, inclusive as antigas.
          </p>
          <FatoresForm
            fatores={(fatores ?? []).map((f) => ({ ...f, fator: Number(f.fator) }))}
            fatorPassivo={Number(config?.fator_pratica_passiva ?? FATOR_PASSIVO_PADRAO)}
          />
        </section>

        <section className="rounded-lg bg-surface-container-low p-5 sm:p-6">
          <h2 className="type-title-large text-on-surface">Alerta de abandono</h2>
          <p className="mt-1 mb-4 type-body-medium text-on-surface-variant">
            Habilidades ativas sem sessão aparecem em destaque no início, com atalho para registrar.
          </p>
          <AlertaForm dias={config?.dias_alerta_abandono ?? DIAS_ALERTA_PADRAO} />
        </section>

        <section className="rounded-lg bg-surface-container-low p-5 sm:p-6">
          <h2 className="type-title-large text-on-surface">Calendário</h2>
          <p className="mt-1 mb-4 type-body-medium text-on-surface-variant">
            Faixa de horário da grade. Blocos e sessões fora dela continuam aparecendo: a grade cresce para mostrá-los.
          </p>
          <CalendarioForm
            inicio={config?.calendario_hora_inicio ?? HORA_INICIO_PADRAO}
            fim={config?.calendario_hora_fim ?? HORA_FIM_PADRAO}
          />
        </section>
      </div>
    </>
  );
}
