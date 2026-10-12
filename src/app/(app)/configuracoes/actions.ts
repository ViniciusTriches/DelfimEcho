"use server";

import { revalidatePath } from "next/cache";
import { getUsuario } from "@/lib/auth";
import { numero, texto } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";

export type EstadoFatores = { ok: boolean; mensagem: string } | null;

const fatorValido = (f: number) => !Number.isNaN(f) && f >= 0 && f <= 1;

export async function salvarFatores(_anterior: EstadoFatores, dados: FormData): Promise<EstadoFatores> {
  const usuario = await getUsuario();
  const supabase = await createClient();

  const fatores = [5, 4, 3, 2, 1].map((nota) => ({
    user_id: usuario.id,
    nota,
    fator: numero(dados, `fator_${nota}`),
    descricao: texto(dados, `descricao_${nota}`) || null,
  }));
  const passivo = numero(dados, "fator_pratica_passiva");

  if (!fatores.every((f) => fatorValido(f.fator)))
    return { ok: false, mensagem: "Os fatores de qualidade vão de 0 a 1." };
  if (!fatorValido(passivo)) return { ok: false, mensagem: "O fator da prática passiva vai de 0 a 1." };

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from("quality_factors").upsert(fatores, { onConflict: "user_id,nota" }),
    supabase
      .from("user_settings")
      .upsert({ user_id: usuario.id, fator_pratica_passiva: passivo }, { onConflict: "user_id" }),
  ]);
  const erro = e1 ?? e2;
  if (erro) return { ok: false, mensagem: `Não foi possível salvar. (${erro.code})` };

  revalidatePath("/", "layout");
  return { ok: true, mensagem: "Fatores salvos. As horas efetivas já foram recalculadas." };
}

export async function salvarAlerta(_anterior: EstadoFatores, dados: FormData): Promise<EstadoFatores> {
  const usuario = await getUsuario();
  const supabase = await createClient();
  const dias = numero(dados, "dias_alerta_abandono");
  if (!Number.isInteger(dias) || dias < 1 || dias > 365) return { ok: false, mensagem: "Use de 1 a 365 dias." };

  const { error } = await supabase
    .from("user_settings")
    .upsert({ user_id: usuario.id, dias_alerta_abandono: dias }, { onConflict: "user_id" });
  if (error) return { ok: false, mensagem: `Não foi possível salvar. (${error.code})` };

  revalidatePath("/", "layout");
  return { ok: true, mensagem: "Alerta atualizado." };
}
