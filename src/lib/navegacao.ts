import {
  CalendarDaysIcon,
  FlagIcon,
  HomeIcon,
  LayersIcon,
  LineChartIcon,
  ListChecksIcon,
  type LucideIcon,
  MilestoneIcon,
  NotebookPenIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react";

export type ItemNav = { href: string; nome: string; icone: LucideIcon; descricao?: string; tambem?: string[] };

// Ação principal (FAB): um toque no celular e no PC.
export const REGISTRAR: ItemNav = {
  href: "/registrar",
  nome: "Registrar sessão",
  icone: PlusIcon,
  tambem: ["/timer"],
};

// Destinos de uso diário (navigation bar no celular, rail no PC). "Mais" entra por último.
export const PRINCIPAIS: ItemNav[] = [
  { href: "/", nome: "Início", icone: HomeIcon, tambem: ["/plano"] },
  { href: "/calendario", nome: "Calendário", icone: CalendarDaysIcon },
  { href: "/habitos", nome: "Hábitos", icone: ListChecksIcon },
  { href: "/areas", nome: "Áreas", icone: LayersIcon, tambem: ["/habilidades"] },
];

// Uso eventual: dentro de "Mais" (página no celular, menu no PC).
export const MAIS: ItemNav[] = [
  { href: "/metas", nome: "Metas", icone: FlagIcon, descricao: "Metas de resultado, prazos e critérios" },
  { href: "/metricas", nome: "Métricas", icone: LineChartIcon, descricao: "Valores como peso e faturamento" },
  { href: "/marcos", nome: "Marcos", icone: MilestoneIcon, descricao: "Linha do tempo de conquistas" },
  { href: "/revisoes", nome: "Revisões", icone: NotebookPenIcon, descricao: "Revisões semanais e mensais" },
  {
    href: "/configuracoes",
    nome: "Configurações",
    icone: SettingsIcon,
    descricao: "Fatores de qualidade, prática passiva, alertas e calendário",
  },
];

/** O item está ativo na rota atual? */
export function itemAtivo(pathname: string, item: ItemNav): boolean {
  return [item.href, ...(item.tambem ?? [])].some((p) => (p === "/" ? pathname === "/" : pathname.startsWith(p)));
}

export function maisAtivo(pathname: string): boolean {
  return pathname.startsWith("/mais") || MAIS.some((i) => itemAtivo(pathname, i));
}
