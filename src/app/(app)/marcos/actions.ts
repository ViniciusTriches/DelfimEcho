"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUsuario } from "@/lib/auth";
import { DIA_VALIDO, destinoSeguro, texto, textoOuNulo } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";
import { ehUuid } from "@/lib/uuid";

export type EstadoForm = { erro: string } | null;

export async function salvarMarco(_anterior: EstadoForm, dados: FormData): Promise<EstadoForm> {
  await getUsuario();
  const supabase = await createClient();

  const id = texto(dados, "id");
  const titulo = texto(dados, "titulo");
  const areaId = texto(dados, "area_id");
  const skillId = texto(dados, "skill_id");
  const data = texto(dados, "data");

  if (!titulo) return { erro: "Dê um título para o marco." };
  if (!ehUuid(areaId)) return { erro: "Escolha a área." };
  if (skillId && !ehUuid(skillId)) return { erro: "Habilidade inválida." };
  if (!DIA_VALIDO.test(data)) return { erro: "Informe a data." };

  const campos = {
    titulo,
    area_id: areaId,
    skill_id: skillId || null,
    descricao: textoOuNulo(dados, "descricao"),
    data,
  };
  const { error } = id
    ? await supabase.from("milestones").update(campos).eq("id", id)
    : await supabase.from("milestones").insert(campos);
  if (error) return { erro: `Não foi possível salvar. (${error.code})` };

  revalidatePath("/", "layout");
  redirect(destinoSeguro(texto(dados, "voltar"), "/marcos"));
}

export async function excluirMarco(id: string) {
  await getUsuario();
  const supabase = await createClient();
  const { error } = await supabase.from("milestones").delete().eq("id", id);
  if (error) return { erro: `Não foi possível excluir. (${error.code})` };
  revalidatePath("/", "layout");
  redirect("/marcos");
}
