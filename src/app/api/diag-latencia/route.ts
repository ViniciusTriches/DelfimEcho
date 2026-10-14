// TEMPORÁRIO: diagnóstico de latência (só números, nenhum dado). Será removido.
import { connection, NextResponse } from "next/server";
import { medirLatencia } from "@/lib/diagnostico-latencia";

export async function GET() {
  await connection();
  const resultado = await medirLatencia(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
  return NextResponse.json({ regiao: process.env.VERCEL_REGION ?? "local", ...resultado });
}
