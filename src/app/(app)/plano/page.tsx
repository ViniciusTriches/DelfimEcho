import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { formatarDiaMes, hojeSP, inicioSemana, somarDias } from "@/lib/datas";
import { carregarOpcoes } from "@/lib/opcoes";
import { todasAsLinhas } from "@/lib/supabase/paginar";
import { createClient } from "@/lib/supabase/server";
import { PlanoForm } from "./plano-form";

export const metadata: Metadata = { title: "Plano da semana" };

export default async function PlanoPage() {
  // Ler os cookies (sessão) antes de usar a hora atual: torna a página dinâmica por requisição.
  const supabase = await createClient();
  const hoje = hojeSP();
  const semana = inicioSemana(hoje);
  const semanaPassada = somarDias(semana, -7);

  const [{ areas }, { data: skills }, { data: planoAtual }, { data: anteriores }, sessoes] = await Promise.all([
    carregarOpcoes(),
    supabase.from("skills").select("id, area_id"), // inclui arquivadas: as horas delas contam para a área
    supabase.from("weekly_plans").select("area_id, horas").eq("semana", semana),
    // Plano mais recente antes desta semana (ponto de partida).
    supabase.from("weekly_plans").select("semana, area_id, horas").lt("semana", semana).order("semana", { ascending: false }).limit(50),
    todasAsLinhas((de, ate) =>
      supabase
        .from("practice_sessions_horas")
        .select("skill_id, horas_efetivas")
        .gte("data_local", semanaPassada)
        .lt("data_local", semana)
        .order("id")
        .range(de, ate),
    ),
  ]);

  const areaDaSkill = new Map((skills ?? []).map((s) => [s.id, s.area_id]));
  const realizado = new Map<string, number>();
  sessoes.forEach((s) => {
    const area = areaDaSkill.get(s.skill_id!);
    if (area) realizado.set(area, (realizado.get(area) ?? 0) + Number(s.horas_efetivas));
  });

  const semanaCopiada = !planoAtual?.length ? (anteriores?.[0]?.semana ?? null) : null;
  const base = planoAtual?.length ? planoAtual : (anteriores ?? []).filter((p) => p.semana === semanaCopiada);
  const horasBase = new Map(base.map((p) => [p.area_id, Number(p.horas)]));

  return (
    <>
      <PageHeader
        titulo="Plano da semana"
        descricao={`Semana de ${formatarDiaMes(semana)} a ${formatarDiaMes(somarDias(semana, 6))} · horas efetivas planejadas por área`}
        voltar={{ href: "/", nome: "Início" }}
      />
      {semanaCopiada && (
        <p className="mb-4 max-w-xl rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
          Valores copiados do plano da semana de {formatarDiaMes(semanaCopiada)}. Ajuste e salve para usar nesta semana.
        </p>
      )}
      {!planoAtual?.length && !semanaCopiada && (
        <p className="mb-4 max-w-xl text-sm text-muted-foreground">
          Primeiro plano: use as horas da semana passada como referência. Deixe vazio as áreas que não entram no plano.
        </p>
      )}
      <PlanoForm
        linhas={areas.map((a) => ({
          areaId: a.id,
          nome: a.nome,
          cor: a.cor,
          horas: horasBase.get(a.id) ?? null,
          realizadoAnterior: realizado.get(a.id) ?? 0,
        }))}
      />
    </>
  );
}
