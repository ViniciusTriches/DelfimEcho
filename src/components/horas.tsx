import { cn } from "@/lib/utils";

const NUM = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

/** Horas como dado: número em Roboto Mono, unidade "h" em Roboto (design system). */
export function Horas({
  valor,
  grande = false,
  className,
}: {
  valor: number;
  grande?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("whitespace-nowrap", className)}>
      <span className={grande ? "numero-grande" : "numero"}>{NUM.format(valor)}</span>
      <span className={grande ? "ml-1" : "ml-0.5"}>h</span>
    </span>
  );
}
