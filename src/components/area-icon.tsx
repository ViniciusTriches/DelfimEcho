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
import { corArea, corAreaSuave, HEX_SLOT } from "@/lib/cores-area";
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

// Paleta de escolha: as 8 cores terrosas (hex do tema claro; o tema escuro usa o token).
export const CORES_AREA = Object.values(HEX_SLOT);

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
      className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-md", className)}
      style={{ backgroundColor: corAreaSuave(cor), color: corArea(cor) }}
    >
      <Icone className="size-5" aria-hidden />
    </span>
  );
}
