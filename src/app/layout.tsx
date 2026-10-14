import type { Metadata, Viewport } from "next";
import { Roboto_Flex, Roboto_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { EcoRipple } from "@/components/eco-ripple";
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

export const metadata: Metadata = {
  title: { default: "Echo", template: "%s · Echo" },
  description: "Registre a prática; o Echo devolve onde você está evoluindo.",
  applicationName: "Echo",
};

export const viewport: Viewport = {
  // Cor da barra do navegador = superfície do tema (creme / café).
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F1E8" },
    { media: "(prefers-color-scheme: dark)", color: "#1D1A15" },
  ],
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
          {children}
          <Toaster position="bottom-center" />
          <EcoRipple />
        </ThemeProvider>
      </body>
    </html>
  );
}
