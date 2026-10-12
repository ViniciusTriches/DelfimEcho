"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUsuario } from "@/lib/auth";
import { numero, texto, textoOuNulo } from "@/lib/form";
import { mover } from "@/lib/ordem";
import { createClient } from "@/lib/supabase/server";
import type { Periodo, TipoMetaTempo } from "@/lib/tipos";
import { ehUuid } from "@/lib/uuid";

export type EstadoForm = { erro: string } | null;

/** Nível como vem do editor: id real (uuid) para existentes, provisório para novos. */
export type NivelForm = { id: string; nome: string; horas: number; fonte: string };

const TIPOS: TipoMetaTempo[] = ["niveis", "periodica", "nenhuma"];
const PERIODOS: Periodo[] = ["semana", "mes"];

function lerNiveis(json: string): NivelForm[] | null {
  try {
    const lista = JSON.parse(json);
    if (!Array.isArray(lista)) return null;
    return lista.map((n) => ({
      id: String(n.id ?? ""),
      nome: String(n.nome ?? "").trim(),
      horas: Number(n.horas),
      fonte: String(n.fonte ?? "").trim(),
    }));
  } catch {
    return null;
  }
}

function validarNiveis(niveis: NivelForm[]): string | null {
  if (niveis.length === 0) return "Adicione pelo menos um nível.";
  const nomes = new Set<string>();
  for (const [i, n] of niveis.entries()) {
    if (!n.nome) return `Dê um nome ao ${i + 1}º nível.`;
    if (!(n.horas > 0)) return `Informe as horas do nível "${n.nome}".`;
    if (i > 0 && n.horas <= niveis[i - 1].horas)
      return `As horas precisam crescer a cada nível ("${n.nome}" deve ter mais horas que "${niveis[i - 1].nome}").`;
    if (nomes.has(n.nome.toLowerCase())) return `Há dois níveis chamados "${n.nome}".`;
    nomes.add(n.nome.toLowerCase());
  }
  return null;
}

/** Cria (sem id) ou atualiza (com id) uma habilidade, com níveis e metas periódicas. */
export async function salvarHabilidade(
  _anterior: EstadoForm,
  dados: FormData,
): Promise<EstadoForm> {
  await getUsuario();
  const supabase = await createClient();

  const id = texto(dados, "id");
  const areaId = texto(dados, "area_id");
  const nome = texto(dados, "nome");
  const tipo = texto(dados, "tipo_meta_tempo") as TipoMetaTempo;
  const nivelTexto = texto(dados, "nivel_atual_autoavaliado");
  const nivelAtual = nivelTexto ? Number(nivelTexto) : null;
  const horasIniciais = numero(dados, "horas_iniciais");

  if (!nome) return { erro: "Dê um nome para a habilidade." };
  if (!ehUuid(areaId)) return { erro: "Escolha a área." };
  if (!TIPOS.includes(tipo)) return { erro: "Escolha o tipo de meta de tempo." };
  if (nivelAtual !== null && !(Number.isInteger(nivelAtual) && nivelAtual >= 1 && nivelAtual <= 10))
    return { erro: "A autoavaliação vai de 1 a 10." };
  if (!Number.isNaN(horasIniciais) && horasIniciais < 0)
    return { erro: "Horas antes do Echo não podem ser negativas." };

  let niveis: NivelForm[] = [];
  if (tipo === "niveis") {
    const lidos = lerNiveis(texto(dados, "niveis") || "[]");
    if (!lidos) return { erro: "Não foi possível ler os níveis." };
    niveis = lidos;
    const erro = validarNiveis(niveis);
    if (erro) return { erro };
  }

  const metas = Object.fromEntries(
    PERIODOS.map((p) => [p, numero(dados, `meta_${p}`)]),
  ) as Record<Periodo, number>;
  if (tipo === "periodica") {
    if (PERIODOS.some((p) => !Number.isNaN(metas[p]) && metas[p] <= 0))
      return { erro: "As horas da meta precisam ser maiores que zero." };
    if (PERIODOS.every((p) => Number.isNaN(metas[p])))
      return { erro: "Informe a meta de horas por semana e/ou por mês." };
  }

  const campos = {
    area_id: areaId,
    nome,
    descricao: textoOuNulo(dados, "descricao"),
    tipo_meta_tempo: tipo,
    nivel_atual_autoavaliado: nivelAtual,
    horas_iniciais: Number.isNaN(horasIniciais) ? 0 : horasIniciais,
    destaque_dashboard: dados.get("destaque_dashboard") === "on",
    permite_pratica_passiva: dados.get("permite_pratica_passiva") === "on",
  };

  // Ordem: fim da lista da área (na criação ou quando muda de área).
  async function proximaOrdem() {
    const { data } = await supabase
      .from("skills")
      .select("ordem")
      .eq("area_id", areaId)
      .order("ordem", { ascending: false })
      .limit(1)
      .maybeSingle();
    return (data?.ordem ?? -1) + 1;
  }

  let skillId = id;
  if (id) {
    const { data: atual } = await supabase.from("skills").select("area_id").eq("id", id).maybeSingle();
    if (!atual) return { erro: "Habilidade não encontrada." };
    const ordem = atual.area_id !== areaId ? { ordem: await proximaOrdem() } : {};
    const { error } = await supabase.from("skills").update({ ...campos, ...ordem }).eq("id", id);
    if (error) return { erro: `Não foi possível salvar. (${error.code})` };
  } else {
    const { data, error } = await supabase
      .from("skills")
      .insert({ ...campos, ordem: await proximaOrdem() })
      .select("id")
      .single();
    if (error) return { erro: `Não foi possível criar. (${error.code})` };
    skillId = data.id;
  }

  // Níveis: atualiza os existentes, apaga os removidos e cria os novos.
  // (Se o tipo deixar de ser "níveis", os níveis ficam guardados para uma eventual volta.)
  if (tipo === "niveis") {
    const linhas = niveis.map((n, ordem) => ({
      skill_id: skillId,
      nome_nivel: n.nome,
      horas_acumuladas_alvo: n.horas,
      fonte_referencia: n.fonte || null,
      ordem,
    }));
    const existentes = niveis
      .map((n, i) => ({ ...linhas[i], id: n.id }))
      .filter((n) => ehUuid(n.id));
    const novos = linhas.filter((_, i) => !ehUuid(niveis[i].id));

    if (existentes.length) {
      const { error } = await supabase.from("skill_levels").upsert(existentes);
      if (error) return { erro: `Erro ao salvar os níveis. (${error.code})` };
    }
    let remover = supabase.from("skill_levels").delete().eq("skill_id", skillId);
    if (existentes.length) remover = remover.not("id", "in", `(${existentes.map((n) => n.id).join(",")})`);
    const { error: erroRemover } = await remover;
    if (erroRemover) return { erro: `Erro ao remover níveis. (${erroRemover.code})` };
    if (novos.length) {
      const { error } = await supabase.from("skill_levels").insert(novos);
      if (error) return { erro: `Erro ao criar os níveis. (${error.code})` };
    }
  }

  // Metas periódicas: uma por período; campo vazio remove a meta daquele período.
  if (tipo === "periodica") {
    for (const periodo of PERIODOS) {
      const horas = metas[periodo];
      const { error } = Number.isNaN(horas)
        ? await supabase.from("periodic_targets").delete().eq("skill_id", skillId).eq("periodo", periodo)
        : await supabase
            .from("periodic_targets")
            .upsert({ skill_id: skillId, periodo, horas_alvo: horas }, { onConflict: "skill_id,periodo" });
      if (error) return { erro: `Erro ao salvar a meta periódica. (${error.code})` };
    }
  }

  revalidatePath("/", "layout");
  redirect(`/habilidades/${skillId}`);
}

// ---------------------------------------------------------------------------
// Autoavaliações
// ---------------------------------------------------------------------------

type Cliente = Awaited<ReturnType<typeof createClient>>;

/** O nível atual da habilidade acompanha a autoavaliação mais recente. */
async function sincronizarNivelAtual(supabase: Cliente, skillId: string) {
  const { data: ultima } = await supabase
    .from("skill_assessments")
    .select("nivel")
    .eq("skill_id", skillId)
    .order("data", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (ultima) await supabase.from("skills").update({ nivel_atual_autoavaliado: ultima.nivel }).eq("id", skillId);
}

export type EstadoAvaliacao = { ok: boolean; mensagem: string } | null;

export async function salvarAvaliacao(_anterior: EstadoAvaliacao, dados: FormData): Promise<EstadoAvaliacao> {
  await getUsuario();
  const supabase = await createClient();

  const skillId = texto(dados, "skill_id");
  const nivel = Number(texto(dados, "nivel"));
  const data = texto(dados, "data");

  if (!ehUuid(skillId)) return { ok: false, mensagem: "Habilidade inválida." };
  if (!(Number.isInteger(nivel) && nivel >= 1 && nivel <= 10))
    return { ok: false, mensagem: "Escolha um nível de 1 a 10." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return { ok: false, mensagem: "Informe a data." };

  const { error } = await supabase
    .from("skill_assessments")
    .insert({ skill_id: skillId, nivel, data, observacao: textoOuNulo(dados, "observacao") });
  if (error) return { ok: false, mensagem: `Não foi possível salvar. (${error.code})` };

  await sincronizarNivelAtual(supabase, skillId);
  revalidatePath("/", "layout");
  return { ok: true, mensagem: "Autoavaliação registrada." };
}

export async function excluirAvaliacao(id: string, skillId: string) {
  await getUsuario();
  const supabase = await createClient();
  const { error } = await supabase.from("skill_assessments").delete().eq("id", id);
  if (error) return { erro: `Não foi possível excluir. (${error.code})` };
  await sincronizarNivelAtual(supabase, skillId);
  revalidatePath("/", "layout");
}

export async function arquivarHabilidade(id: string, arquivada: boolean) {
  await getUsuario();
  const supabase = await createClient();
  const { error } = await supabase.from("skills").update({ arquivada }).eq("id", id);
  if (error) return { erro: `Não foi possível ${arquivada ? "arquivar" : "restaurar"}. (${error.code})` };
  revalidatePath("/", "layout");
}

export async function excluirHabilidade(id: string) {
  await getUsuario();
  const supabase = await createClient();
  const { data: skill } = await supabase.from("skills").select("area_id").eq("id", id).maybeSingle();
  const { error } = await supabase.from("skills").delete().eq("id", id);
  if (error) return { erro: `Não foi possível excluir. (${error.code})` };
  revalidatePath("/", "layout");
  redirect(skill ? `/areas/${skill.area_id}` : "/areas");
}

export async function moverHabilidade(id: string, direcao: "cima" | "baixo") {
  await getUsuario();
  const supabase = await createClient();
  const { data: skill } = await supabase.from("skills").select("area_id").eq("id", id).maybeSingle();
  if (!skill) return;
  const { data } = await supabase
    .from("skills")
    .select("id")
    .eq("area_id", skill.area_id)
    .eq("arquivada", false)
    .order("ordem")
    .order("criado_em");
  await mover(supabase, "skills", (data ?? []).map((s) => s.id), id, direcao);
  revalidatePath("/", "layout");
}
