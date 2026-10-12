import {
  BookOpenIcon,
  BrainIcon,
  BriefcaseIcon,
  CodeIcon,
  DumbbellIcon,
  GraduationCapIcon,
  HeartIcon,
  LanguagesIcon,
  type LucideIcon,
  MusicIcon,
  PaletteIcon,
  PiggyBankIcon,
  SparklesIcon,
  StoreIcon,
  TargetIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Ícones disponíveis para áreas (o banco guarda o nome).
export const ICONES_AREA: Record<string, LucideIcon> = {
  briefcase: BriefcaseIcon,
  "trending-up": TrendingUpIcon,
  store: StoreIcon,
  "graduation-cap": GraduationCapIcon,
  "book-open": BookOpenIcon,
  languages: LanguagesIcon,
  dumbbell: DumbbellIcon,
  heart: HeartIcon,
  brain: BrainIcon,
  target: TargetIcon,
  users: UsersIcon,
  "piggy-bank": PiggyBankIcon,
  code: CodeIcon,
  music: MusicIcon,
  palette: PaletteIcon,
  sparkles: SparklesIcon,
};

export const CORES_AREA = [
  "#3b82f6",
  "#0ea5e9",
  "#14b8a6",
  "#10b981",
  "#84cc16",
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
  "#6366f1",
  "#64748b",
];

/** Ícone da área num quadrado com a cor dela. */
export function AreaIcon({
  icone,
  cor,
  className,
}: {
  icone: string | null;
  cor: string;
  className?: string;
}) {
  const Icone = (icone && ICONES_AREA[icone]) || TargetIcon;
  return (
    <span
      className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-lg", className)}
      style={{ backgroundColor: `${cor}22`, color: cor }}
    >
      <Icone className="size-5" aria-hidden />
    </span>
  );
}
