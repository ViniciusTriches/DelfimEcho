"use server";

import { revalidatePath } from "next/cache";
import { getUsuario } from "@/lib/auth";
import { diaIso, instanteSP, localSP } from "@/lib/calendario";
import { somarDias } from "@/lib/datas";
import { DIA_VALIDO, texto, textoOuNulo } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";
import { ehUuid } from "@/lib/uuid";

export type Resultado = { erro?: string; ok?: boolean } | null;
/** "este": só esta ocorrência; "seguintes": esta e as próximas da série. */
export type Escopo = "este" | "seguintes";

const HORA = /^([01]\d|2[0-3]):([0-5]\d)$/;
const minutos = (hora: string) => Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5));

type Valores = {
  skill_id: string;
  inicio: string;
  fim: string;
  observacao: string | null;
  repete_dias: number[] | null;
  repete_ate: string | null;
};

function lerFormulario(dados: FormData): Valores | { erro: string } {
  const skillId = texto(dados, "skill_id");
  const data = texto(dados, "data");
  const hIni = texto(dados, "hora_inicio");
  const hFim = texto(dados, "hora_fim");
  if (!ehUuid(skillId)) return { erro: "Escolha a habilidade." };
  if (!DIA_VALIDO.test(data)) return { erro: "Informe a data." };
  if (!HORA.test(hIni) || !HORA.test(hFim)) return { erro: "Informe o horário de início e de fim." };
  const ini = minutos(hIni);
  const fim = minutos(hFim) === 0 ? 1440 : minutos(hFim); // 00:00 no fim = meia-noite
  if (fim <= ini) return { erro: "O fim precisa ser depois do início." };

  let repete_dias: number[] | null = null;
  let repete_ate: string | null = null;
  if (dados.get("repetir") === "on") {
    repete_dias = [...new Set(dados.getAll("dias").map(Number))].filter((d) => d >= 1 && d <= 7).sort();
    if (!repete_dias.length) return { erro: "Escolha ao menos um dia da semana para repetir." };
    const ate = texto(dados, "repete_ate");
    if (ate) {
      if (!DIA_VALIDO.test(ate)) return { erro: "Data final da repetição inválida." };
      if (ate < data) return { erro: "A repetição precisa terminar depois do primeiro dia." };
      repete_ate = ate;
    }
  }

  return {
    skill_id: skillId,
    inicio: instanteSP(data, ini).toISOString(),
    fim: instanteSP(data, fim).toISOString(),
    observacao: textoOuNulo(dados, "observacao"),
    repete_dias,
    repete_ate,
  };
}

function concluir(): Resultado {
  revalidatePath("/", "layout");
  return { ok: true };
}

async function lerBloco(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("planned_blocks").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function criarBloco(_anterior: Resultado, dados: FormData): Promise<Resultado> {
  await getUsuario();
  const valores = lerFormulario(dados);
  if ("erro" in valores) return valores;
  const supabase = await createClient();
  const { error } = await supabase.from("planned_blocks").insert(valores);
  if (error) return { erro: `Não foi possível criar o bloco. (${error.code})` };
  return concluir();
}

/**
 * Aplica novos valores a uma ocorrência. Bloco avulso: atualiza. Série, "este": a data sai
 * da série e a versão nova vira um bloco avulso. Série, "seguintes": a série antiga termina
 * na véspera e a nova começa nesta ocorrência (ou a série inteira muda, se for a primeira).
 */
async function aplicar(id: string, ocorrencia: string, escopo: Escopo, novos: Valores): Promise<Resultado> {
  const supabase = await createClient();
  const bloco = await lerBloco(id);
  if (!bloco) return { erro: "Bloco não encontrado." };

  const primeira = localSP(bloco.inicio).dia;
  const serie = Boolean(bloco.repete_dias?.length);

  if (!serie || (escopo === "seguintes" && ocorrencia <= primeira)) {
    const { error } = await supabase.from("planned_blocks").update(novos).eq("id", id);
    if (error) return { erro: `Não foi possível salvar. (${error.code})` };
    return concluir();
  }

  if (escopo === "este") {
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase
        .from("planned_blocks")
        .update({ datas_excluidas: [...new Set([...bloco.datas_excluidas, ocorrencia])] })
        .eq("id", id),
      supabase.from("planned_blocks").insert({ ...novos, repete_dias: null, repete_ate: null }),
    ]);
    if (e1 || e2) return { erro: `Não foi possível salvar. (${(e1 ?? e2)!.code})` };
    return concluir();
  }

  // "seguintes" a partir de uma ocorrência do meio da série.
  const vespera = somarDias(ocorrencia, -1);
  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase
      .from("planned_blocks")
      .update({ repete_ate: vespera, datas_excluidas: bloco.datas_excluidas.filter((d) => d <= vespera) })
      .eq("id", id),
    supabase.from("planned_blocks").insert({
      ...novos,
      datas_excluidas: novos.repete_dias ? bloco.datas_excluidas.filter((d) => d > vespera) : [],
    }),
  ]);
  if (e1 || e2) return { erro: `Não foi possível salvar. (${(e1 ?? e2)!.code})` };
  return concluir();
}

export async function editarBloco(_anterior: Resultado, dados: FormData): Promise<Resultado> {
  await getUsuario();
  const id = texto(dados, "id");
  const ocorrencia = texto(dados, "ocorrencia");
  const escopo: Escopo = texto(dados, "escopo") === "seguintes" ? "seguintes" : "este";
  if (!ehUuid(id) || !DIA_VALIDO.test(ocorrencia)) return { erro: "Bloco inválido." };
  const valores = lerFormulario(dados);
  if ("erro" in valores) return valores;
  return aplicar(id, ocorrencia, escopo, valores);
}

/** Arrastar (mover) ou puxar a borda (duração) de uma ocorrência. */
export async function moverBloco(
  id: string,
  ocorrencia: string,
  inicio: string,
  fim: string,
  escopo: Escopo,
): Promise<Resultado> {
  await getUsuario();
  if (!ehUuid(id) || !DIA_VALIDO.test(ocorrencia)) return { erro: "Bloco inválido." };
  const ini = new Date(inicio);
  const f = new Date(fim);
  if (Number.isNaN(ini.getTime()) || Number.isNaN(f.getTime()) || f <= ini) return { erro: "Horário inválido." };
  if (f.getTime() - ini.getTime() > 86_400_000) return { erro: "Um bloco pode ter no máximo 24 horas." };

  const bloco = await lerBloco(id);
  if (!bloco) return { erro: "Bloco não encontrado." };
  const novoDia = localSP(ini).dia;
  // Série movida para outro dia: só esta ocorrência (os dias da série continuam os mesmos).
  const escopoFinal: Escopo = novoDia !== ocorrencia ? "este" : escopo;

  let repete_dias = bloco.repete_dias;
  if (repete_dias?.length && escopoFinal === "seguintes" && !repete_dias.includes(diaIso(novoDia))) {
    repete_dias = [...repete_dias, diaIso(novoDia)].sort();
  }

  return aplicar(id, ocorrencia, escopoFinal, {
    skill_id: bloco.skill_id,
    inicio: ini.toISOString(),
    fim: f.toISOString(),
    observacao: bloco.observacao,
    repete_dias,
    repete_ate: bloco.repete_ate,
  });
}

export async function excluirBloco(id: string, ocorrencia: string, escopo: Escopo): Promise<Resultado> {
  await getUsuario();
  if (!ehUuid(id) || !DIA_VALIDO.test(ocorrencia)) return { erro: "Bloco inválido." };
  const supabase = await createClient();
  const bloco = await lerBloco(id);
  if (!bloco) return { erro: "Bloco não encontrado." };

  const primeira = localSP(bloco.inicio).dia;
  const serie = Boolean(bloco.repete_dias?.length);
  let erro;
  if (!serie || (escopo === "seguintes" && ocorrencia <= primeira)) {
    ({ error: erro } = await supabase.from("planned_blocks").delete().eq("id", id));
  } else if (escopo === "este") {
    ({ error: erro } = await supabase
      .from("planned_blocks")
      .update({ datas_excluidas: [...new Set([...bloco.datas_excluidas, ocorrencia])] })
      .eq("id", id));
  } else {
    const vespera = somarDias(ocorrencia, -1);
    ({ error: erro } = await supabase
      .from("planned_blocks")
      .update({ repete_ate: vespera, datas_excluidas: bloco.datas_excluidas.filter((d) => d <= vespera) })
      .eq("id", id));
  }
  if (erro) return { erro: `Não foi possível excluir. (${erro.code})` };
  return concluir();
}
