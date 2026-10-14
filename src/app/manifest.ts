import type { MetadataRoute } from "next";

// Cores do tema claro (o padrão do app): a tela de abertura do Android usa o fundo creme
// com o ícone; a barra do sistema começa creme e acompanha o tema depois (cor-tema.tsx).
const CREME = "#F8F1E8";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Echo",
    short_name: "Echo",
    description: "Registre a prática; o Echo devolve onde você está evoluindo.",
    lang: "pt-BR",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: CREME,
    theme_color: CREME,
    categories: ["productivity", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    // Pressionar o ícone no Android.
    shortcuts: [
      {
        name: "Registrar sessão",
        short_name: "Registrar",
        url: "/registrar",
        icons: [{ src: "/icons/atalho-registrar.png", sizes: "96x96", type: "image/png" }],
      },
      {
        name: "Calendário de hoje",
        short_name: "Hoje",
        url: "/calendario?visao=dia",
        icons: [{ src: "/icons/atalho-calendario.png", sizes: "96x96", type: "image/png" }],
      },
      {
        name: "Iniciar timer",
        short_name: "Timer",
        url: "/timer",
        icons: [{ src: "/icons/atalho-timer.png", sizes: "96x96", type: "image/png" }],
      },
      {
        name: "Hábitos de hoje",
        short_name: "Hábitos",
        url: "/habitos",
        icons: [{ src: "/icons/atalho-habitos.png", sizes: "96x96", type: "image/png" }],
      },
    ],
  };
}
