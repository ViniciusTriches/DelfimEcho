import {
  FlagIcon,
  HomeIcon,
  LayersIcon,
  LineChartIcon,
  ListChecksIcon,
  type LucideIcon,
  MilestoneIcon,
  NotebookPenIcon,
  PlusCircleIcon,
  SettingsIcon,
} from "lucide-react";

export type ItemNav = { href: string; nome: string; icone: LucideIcon; descricao?: string; tambem?: string[] };

// Uso diário: um toque no celular (barra inferior com no máximo 5 itens, contando o "Mais").
export const PRINCIPAIS: ItemNav[] = [
  { href: "/", nome: "Início", icone: HomeIcon },
  { href: "/registrar", nome: "Registrar", icone: PlusCircleIcon, tambem: ["/timer"] },
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
    descricao: "Fatores de qualidade e prática passiva",
  },
];
