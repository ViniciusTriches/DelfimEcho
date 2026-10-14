import type { Metadata, Viewport } from "next";
import { Roboto_Flex, Roboto_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AtualizacaoApp } from "@/components/atualizacao-app";
import { CorTema } from "@/components/cor-tema";
import { EcoRipple } from "@/components/eco-ripple";
import { Movimento } from "@/components/movimento";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const robotoFlex = Roboto_Flex({
  variable: "--font-roboto-flex",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

// Telas de abertura do iPhone (geradas por scripts/gerar-icones.mjs): [px largura, px altura, pt largura, pt altura].
const SPLASH: [number, number, number, number][] = [
  [1320, 2868, 440, 956],
  [1206, 2622, 402, 874],
  [1290, 2796, 430, 932],
  [1179, 2556, 393, 852],
  [1284, 2778, 428, 926],
  [1170, 2532, 390, 844],
  [1125, 2436, 375, 812],
  [1242, 2688, 414, 896],
  [828, 1792, 414, 896],
  [1242, 2208, 414, 736],
  [750, 1334, 375, 667],
  [640, 1136, 320, 568],
];

export const metadata: Metadata = {
  title: { default: "Echo", template: "%s · Echo" },
  description: "Registre a prática; o Echo devolve onde você está evoluindo.",
  applicationName: "Echo",
  // iPhone: "Adicionar à Tela de Início" abre em tela cheia, com nome e abertura próprios.
  appleWebApp: {
    capable: true,
    title: "Echo",
    statusBarStyle: "default",
    startupImage: SPLASH.map(([l, a, pl, pa]) => ({
      url: `/splash/splash-${l}x${a}.png`,
      media: `(device-width: ${pl}px) and (device-height: ${pa}px) and (-webkit-device-pixel-ratio: ${Math.round(l / pl)}) and (orientation: portrait)`,
    })),
  },
  formatDetection: { telephone: false },
  // O Next emite só "mobile-web-app-capable"; iOS mais antigos ainda leem a versão da Apple
  // (inclusive para usar as telas de abertura).
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  // Barra do sistema = superfície do tema. Começa creme (tema padrão); cor-tema.tsx troca
  // para café quando o app está no tema escuro.
  themeColor: "#F8F1E8",
  // Ocupa a tela toda (notch e barra inferior); as áreas seguras ficam no CSS.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${robotoFlex.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <Movimento>{children}</Movimento>
          {/* Snackbar acima da barra de navegação e do FAB (celular), fora da área da barra inferior do iPhone. */}
          <Toaster position="bottom-center" mobileOffset={{ bottom: "calc(9.75rem + env(safe-area-inset-bottom))" }} />
          <EcoRipple />
          <CorTema />
          <AtualizacaoApp />
        </ThemeProvider>
      </body>
    </html>
  );
}
