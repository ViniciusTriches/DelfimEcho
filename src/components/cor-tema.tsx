"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

// Superfície de cada tema (tema.css): a barra do sistema/navegador acompanha o app.
const SUPERFICIE = { light: "#F8F1E8", dark: "#1D1A15" } as const;

/** Mantém a meta theme-color igual ao tema escolhido no app (o padrão é o claro). */
export function CorTema() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    const cor = SUPERFICIE[resolvedTheme === "dark" ? "dark" : "light"];
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", cor));
  }, [resolvedTheme]);
  return null;
}
