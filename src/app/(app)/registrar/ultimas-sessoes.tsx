import { Trash2Icon } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { Badge } from "@/components/ui/badge";
import { formatarDataHora, formatarDuracao } from "@/lib/datas";
import { formatarHoras } from "@/lib/formato";
import { createClient } from "@/lib/supabase/server";
import { excluirSessao } from "./actions";

/** As sessões mais recentes, para conferir (e apagar) o que acabou de registrar. */
export async function UltimasSessoes() {
  const supabase = await createClient();
  const [{ data: sessoes }, { data: skills }] = await Promise.all([
    supabase
      .from("practice_sessions_horas")
      .select("id, skill_id, inicio, duracao_minutos, nota_qualidade, tipo_pratica, horas_efetivas, foco_especifico")
      .order("inicio", { ascending: false })
      .limit(5),
    supabase.from("skills").select("id, nome"),
  ]);
  if (!sessoes?.length) return null;

  const nomes = new Map(skills?.map((s) => [s.id, s.nome]));

  return (
    <section className="mt-12 max-w-xl">
      <h2 className="mb-4 type-title-large text-on-surface">Últimas sessões</h2>
      <ul className="flex flex-col divide-y divide-outline-variant overflow-hidden rounded-lg bg-surface-container-low">
        {sessoes.map((s) => (
          <li key={s.id} className="flex items-center gap-3 py-3 pr-2 pl-4 type-body-medium">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2">
                <span className="type-title-small text-on-surface">{nomes.get(s.skill_id!) ?? "—"}</span>
                {s.tipo_pratica === "passiva" && <Badge variant="secondary">passiva</Badge>}
              </div>
              <p className="text-on-surface-variant">
                {formatarDataHora(s.inicio!)} · {formatarDuracao(s.duracao_minutos!)} · nota {s.nota_qualidade} ·{" "}
                <span className="text-on-surface">{formatarHoras(Number(s.horas_efetivas))}</span> efetivas
              </p>
              {s.foco_especifico && <p className="truncate text-on-surface-variant">{s.foco_especifico}</p>}
            </div>
            <ConfirmButton
              acao={excluirSessao.bind(null, s.id!)}
              confirmar="Excluir esta sessão?"
              variant="ghost"
              size="icon-sm"
              aria-label="Excluir sessão"
            >
              <Trash2Icon />
            </ConfirmButton>
          </li>
        ))}
      </ul>
    </section>
  );
}
