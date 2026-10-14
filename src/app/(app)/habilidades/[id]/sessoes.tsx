import Link from "next/link";
import { Trash2Icon } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatarDataHora, formatarDuracao } from "@/lib/datas";
import { formatarHoras } from "@/lib/formato";
import { createClient } from "@/lib/supabase/server";
import { excluirSessao } from "../../registrar/actions";

const LIMITE = 20;

/** Sessões da habilidade, mais recentes primeiro, com as reflexões. */
export async function SessoesHabilidade({ skillId, todas }: { skillId: string; todas: boolean }) {
  const supabase = await createClient();
  let consulta = supabase
    .from("practice_sessions_horas")
    .select("*", { count: "exact" })
    .eq("skill_id", skillId)
    .order("inicio", { ascending: false });
  if (!todas) consulta = consulta.limit(LIMITE);
  const { data: sessoes, count } = await consulta;

  if (!sessoes?.length) return <p className="type-body-medium text-on-surface-variant">Nenhuma sessão registrada ainda.</p>;

  return (
    <>
      <ul className="flex flex-col gap-3">
        {sessoes.map((s) => {
          const reflexoes = [
            ["Aprendi", s.aprendizado],
            ["Erros", s.erros],
            ["Próximo passo", s.proximo_passo],
          ].filter(([, texto]) => texto) as [string, string][];
          return (
            <li key={s.id} className="rounded-lg bg-surface-container-low py-4 pr-2 pl-5">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="type-body-medium text-on-surface-variant">
                    {formatarDataHora(s.inicio!)} · {formatarDuracao(s.duracao_minutos!)} · nota {s.nota_qualidade} ·{" "}
                    <span className="text-on-surface">{formatarHoras(Number(s.horas_efetivas))} efetivas</span>
                  </p>
                  {s.foco_especifico && <p className="mt-1 type-title-small text-on-surface">{s.foco_especifico}</p>}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.tipo_pratica === "passiva" && <Badge variant="secondary">passiva</Badge>}
                    {s.teve_feedback && <Badge variant="secondary">com feedback</Badge>}
                    {(s.distracoes ?? 0) > 0 && (
                      <Badge variant="outline">
                        {s.distracoes} {s.distracoes === 1 ? "distração" : "distrações"}
                      </Badge>
                    )}
                  </div>
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
              </div>
              {reflexoes.length > 0 && (
                <dl className="mt-4 mr-3 flex flex-col gap-3 border-t border-outline-variant pt-4 type-body-medium text-on-surface">
                  {reflexoes.map(([rotulo, texto]) => (
                    <div key={rotulo}>
                      <dt className="type-label-medium text-on-surface-variant">{rotulo}</dt>
                      <dd className="whitespace-pre-line">{texto}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </li>
          );
        })}
      </ul>
      {!todas && (count ?? 0) > LIMITE && (
        <Link href={`/habilidades/${skillId}?sessoes=todas`} className={buttonVariants({ variant: "text", className: "mt-3 -ml-3" })} scroll={false}>
          Mostrar todas as {count} sessões
        </Link>
      )}
    </>
  );
}
