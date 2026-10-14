import { cn } from "cn"

/**
 * Indicador de progresso linear do Material 3 (determinado): preenchimento arredondado,
 * vão de 4px até o trilho tonal e o ponto de parada no fim do trilho.
 * `fracao` de 0 a 1 (acima de 1 fica cheio).
 */
export function Progresso({
  fracao,
  rotulo,
  className,
  corPreenchimento = "bg-primary",
  corTrilho = "bg-secondary-container",
}: {
  fracao: number
  rotulo: string
  className?: string
  corPreenchimento?: string
  corTrilho?: string
}) {
  const pct = Math.min(100, Math.max(0, fracao * 100))
  const cheio = pct >= 100
  return (
    <div
      role="progressbar"
      aria-label={rotulo}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={cn("relative flex h-1.5 w-full items-center gap-1", className)}
    >
      {pct > 0 && (
        <span
          data-slot="progresso-preenchimento"
          className={cn("h-full rounded-full transition-[width] duration-500 ease-emphasized-decelerate motion-reduce:transition-none", corPreenchimento)}
          style={{ width: cheio ? "100%" : `calc(${pct}% - 2px)` }}
        />
      )}
      {!cheio && (
        <span className={cn("relative h-full flex-1 rounded-full", corTrilho)}>
          {/* ponto de parada (indica o fim do trilho) */}
          <span className={cn("absolute top-1/2 right-0.5 size-1 -translate-y-1/2 rounded-full", corPreenchimento)} />
        </span>
      )}
    </div>
  )
}
