"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUsuario } from "@/lib/auth";
import { DIA_VALIDO, destinoSeguro, texto, textoOuNulo } from "@/lib/form";
import type { StatusMeta } from "@/lib/metas";
import { createClient } from "@/lib/supabase/server";
import { ehUuid } from "@/lib/uuid";

export type EstadoForm = { erro: string } | null;

/** Cria (sem id) ou atualiza (com id) uma meta de resultado. */
export async function salvarMeta(_anterior: EstadoForm, dados: FormData): Promise<EstadoForm> {
  await getUsuario();
  const supabase = await createClient();

  const id = texto(dados, "id");
  const titulo = texto(dados, "titulo");
  const areaId = texto(dados, "area_id");
  const skillId = texto(dados, "skill_id");
  const prazo = texto(dados, "prazo");

  if (!titulo) return { erro: "Dê um título para a meta." };
  if (!ehUuid(areaId)) return { erro: "Escolha a área." };
  if (skillId && !ehUuid(skillId)) return { erro: "Habilidade inválida." };
  if (prazo && !DIA_VALIDO.test(prazo)) return { erro: "Prazo inválido." };

  if (skillId) {
    const { data: skill } = await supabase.from("skills").select("area_id").eq("id", skillId).maybeSingle();
    if (skill?.area_id !== areaId) return { erro: "A habilidade escolhida não é dessa área." };
  }

  const campos = {
    titulo,
    area_id: areaId,
    skill_id: skillId || null,
    criterio_de_conclusao: textoOuNulo(dados, "criterio_de_conclusao"),
    prazo: prazo || null,
  };

  const { error } = id
    ? await supabase.from("goals").update(campos).eq("id", id)
    : await supabase.from("goals").insert(campos);
  if (error) return { erro: `Não foi possível salvar. (${error.code})` };

  revalidatePath("/", "layout");
  redirect(destinoSeguro(texto(dados, "voltar"), "/metas"));
}

export async function alterarStatusMeta(id: string, status: StatusMeta) {
  await getUsuario();
  const supabase = await createClient();
  const { error } = await supabase
    .from("goals")
    .update({ status, concluida_em: status === "concluida" ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return { erro: `Não foi possível atualizar. (${error.code})` };
  revalidatePath("/", "layout");
}

export async function excluirMeta(id: string) {
  await getUsuario();
  const supabase = await createClient();
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) return { erro: `Não foi possível excluir. (${error.code})` };
  revalidatePath("/", "layout");
  redirect("/metas");
}
