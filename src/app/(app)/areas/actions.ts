"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUsuario } from "@/lib/auth";
import { texto, textoOuNulo } from "@/lib/form";
import { mover } from "@/lib/ordem";
import { createClient } from "@/lib/supabase/server";

export type EstadoForm = { erro: string } | null;

const COR_VALIDA = /^#[0-9a-f]{6}$/i;

/** Cria (sem id) ou atualiza (com id) uma área. */
export async function salvarArea(_anterior: EstadoForm, dados: FormData): Promise<EstadoForm> {
  await getUsuario();
  const supabase = await createClient();

  const id = texto(dados, "id");
  const nome = texto(dados, "nome");
  const cor = texto(dados, "cor");
  const campos = {
    nome,
    descricao: textoOuNulo(dados, "descricao"),
    cor: COR_VALIDA.test(cor) ? cor : "#0ea5e9",
    icone: textoOuNulo(dados, "icone"),
  };

  if (!nome) return { erro: "Dê um nome para a área." };

  let areaId = id;
  if (id) {
    const { error } = await supabase.from("areas").update(campos).eq("id", id);
    if (error) return { erro: `Não foi possível salvar. (${error.code})` };
  } else {
    // Nova área vai para o fim da lista.
    const { data: ultima } = await supabase
      .from("areas")
      .select("ordem")
      .order("ordem", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data, error } = await supabase
      .from("areas")
      .insert({ ...campos, ordem: (ultima?.ordem ?? -1) + 1 })
      .select("id")
      .single();
    if (error) return { erro: `Não foi possível criar. (${error.code})` };
    areaId = data.id;
  }

  revalidatePath("/", "layout");
  redirect(`/areas/${areaId}`);
}

export async function arquivarArea(id: string, arquivada: boolean) {
  await getUsuario();
  const supabase = await createClient();
  const { error } = await supabase.from("areas").update({ arquivada }).eq("id", id);
  if (error) return { erro: `Não foi possível ${arquivada ? "arquivar" : "restaurar"}. (${error.code})` };
  revalidatePath("/", "layout");
}

export async function excluirArea(id: string) {
  await getUsuario();
  const supabase = await createClient();
  const { error } = await supabase.from("areas").delete().eq("id", id);
  if (error) return { erro: `Não foi possível excluir. (${error.code})` };
  revalidatePath("/", "layout");
  redirect("/areas");
}

export async function moverArea(id: string, direcao: "cima" | "baixo") {
  await getUsuario();
  const supabase = await createClient();
  const { data } = await supabase
    .from("areas")
    .select("id")
    .eq("arquivada", false)
    .order("ordem")
    .order("criado_em");
  await mover(supabase, "areas", (data ?? []).map((a) => a.id), id, direcao);
  revalidatePath("/", "layout");
}
