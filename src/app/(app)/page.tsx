import Link from "next/link";
import { getUsuario } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Dashboard provisório da Fase 1: confirma login, RLS e seed.
export default async function DashboardPage() {
  const usuario = await getUsuario();
  const supabase = await createClient();

  const [{ data: areas, error }, { count: habitos }, { data: fatores }] = await Promise.all([
    supabase
      .from("areas")
      .select("id, nome, descricao, cor, skills(count), metrics(count)")
      .eq("arquivada", false)
      .order("ordem"),
    supabase.from("habits").select("id", { count: "exact", head: true }),
    supabase.from("quality_factors").select("nota, fator").order("nota", { ascending: false }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Olá!</h1>
        <p className="text-sm text-muted-foreground">Conectado como {usuario.email}</p>
      </div>

      {error && (
        <p className="text-sm text-destructive">
          Erro ao ler o banco: {error.message}. As migrations foram aplicadas?
        </p>
      )}

      {areas && areas.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhuma área ainda. Rode <code>supabase/seed.sql</code> no SQL Editor do Supabase para
          criar os dados iniciais.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {areas?.map((area) => (
          <Link key={area.id} href={`/areas/${area.id}`}>
            <Card
              className="h-full border-l-4 transition-colors hover:bg-muted/50"
              style={{ borderLeftColor: area.cor }}
            >
              <CardHeader>
                <CardTitle>{area.nome}</CardTitle>
                <CardDescription>{area.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {area.skills[0]?.count ?? 0} habilidade(s) · {area.metrics[0]?.count ?? 0} métrica(s)
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {habitos ?? 0} hábito(s) · Fatores de qualidade:{" "}
        {fatores?.map((f) => `${f.nota}→${Number(f.fator).toFixed(2)}`).join("  ")}
      </p>
    </div>
  );
}
