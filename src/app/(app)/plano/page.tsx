import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { formatarDiaMes, hojeSP, inicioSemana, somarDias } from "@/lib/datas";
import { DIA_VALIDO } from "@/lib/form";
import { carregarOpcoes } from "@/lib/opcoes";
import { semanasPlanejaveis } from "@/lib/revisoes";
import { todasAsLinhas } from "@/lib/supabase/paginar";
import { createClient } from "@/lib/supabase/server";
import { PlanoForm } from "./plano-form";

export const metadata: Metadata = { title: "Plano da semana" };

const ARREDONDAR = (h: number) => Math.round(h * 2) / 2; // meia hora

/**
 * ?semana= semana a planejar (atual ou próxima). ?base= semana usada como ponto de partida
 * quando a semana ainda não tem plano (ex.: a semana revisada). Sem base: o plano mais recente.
 */
export default async function PlanoPage({ searchParams }: PageProps<"/plano">) {
  const params = await searchParams;
  // Ler os cookies (sessão) antes de usar a hora atual: torna a página dinâmica por requisição.
  const supabase = await createClient();
  const hoje = hojeSP();
  const permitidas = semanasPlanejaveis(hoje);
  const [atual] = permitidas;
  const semana = typeof params.semana === "string" && permitidas.includes(params.semana) ? params.semana : atual;
  const base =
    typeof params.base === "string" && DIA_VALIDO.test(params.base) && params.base < semana
      ? inicioSemana(params.base)
      : null;
  const referencia = base ?? somarDias(semana, -7); // semana cujas horas realizadas servem de referência
  const salvo = params.salvo === "1";

  const [{ areas }, { data: skills }, { data: planoAtual }, { data: anteriores }, sessoes] = await Promise.all([
    carregarOpcoes(),
    supabase.from("skills").select("id, area_id"), // inclui arquivadas: as horas delas contam para a área
    supabase.from("weekly_plans").select("area_id, horas").eq("semana", semana),
    supabase
      .from("weekly_plans")
      .select("semana, area_id, horas")
      .lt("semana", semana)
      .order("semana", { ascending: false })
      .limit(100),
    todasAsLinhas((de, ate) =>
      supabase
        .from("practice_sessions_horas")
        .select("skill_id, horas_efetivas")
        .gte("data_local", referencia)
        .lte("data_local", somarDias(referencia, 6))
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

  // Ponto de partida: plano já salvo > plano da semana base > horas realizadas na base > plano mais recente.
  let horasBase = new Map<string, number>();
  let origem: string | null = null;
  if (planoAtual?.length) {
    horasBase = new Map(planoAtual.map((p) => [p.area_id, Number(p.horas)]));
  } else if (base) {
    const doBase = (anteriores ?? []).filter((p) => p.semana === base);
    if (doBase.length) {
      horasBase = new Map(doBase.map((p) => [p.area_id, Number(p.horas)]));
      origem = `Valores copiados do plano da semana de ${formatarDiaMes(base)}.`;
    } else {
      horasBase = new Map([...realizado].filter(([, h]) => h > 0).map(([a, h]) => [a, ARREDONDAR(h)]));
      origem = `A semana de ${formatarDiaMes(base)} não tinha plano: valores sugeridos a partir das horas realizadas nela.`;
    }
  } else if (anteriores?.length) {
    const ultima = anteriores[0].semana;
    horasBase = new Map(anteriores.filter((p) => p.semana === ultima).map((p) => [p.area_id, Number(p.horas)]));
    origem = `Valores copiados do plano da semana de ${formatarDiaMes(ultima)}.`;
  }

  return (
    <>
      <PageHeader
        titulo={semana === atual ? "Plano da semana" : "Plano da próxima semana"}
        descricao={`Semana de ${formatarDiaMes(semana)} a ${formatarDiaMes(somarDias(semana, 6))} · horas efetivas planejadas por área`}
        voltar={{ href: "/", nome: "Início" }}
      />
      {salvo && (
        <p role="status" className="mb-4 max-w-xl rounded-lg border p-3 type-body-medium">
          Plano salvo. <Link href="/" className="underline underline-offset-2">Voltar ao início</Link>
        </p>
      )}
      {origem && (
        <p className="mb-4 max-w-xl rounded-lg bg-secondary-container text-on-secondary-container p-3 type-body-medium">
          {origem} Ajuste e salve.
        </p>
      )}
      {!planoAtual?.length && !origem && (
        <p className="mb-4 max-w-xl type-body-medium text-on-surface-variant">
          Primeiro plano: use as horas da semana anterior como referência. Deixe vazio as áreas que não entram no plano.
        </p>
      )}
      <PlanoForm
        key={semana}
        semana={semana}
        rotuloReferencia={`Semana de ${formatarDiaMes(referencia)}`}
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
