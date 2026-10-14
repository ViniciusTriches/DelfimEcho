import { cva, type VariantProps } from "class-variance-authority"
import { CheckIcon } from "lucide-react"
import { cn } from "cn"

// Chips Material 3 (filtro / assistente). Use `chipVariants` em links; `Chip` em botões.
export const chipVariants = cva(
  "camada-estado inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-sm border px-4 type-label-large whitespace-nowrap transition-colors duration-150 ease-standard outline-none pointer-coarse:min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&_svg]:size-[1.125rem] [&_svg]:shrink-0",
  {
    variants: {
      selecionado: {
        true: "border-transparent bg-secondary-container pl-2 text-on-secondary-container",
        false: "border-outline-variant bg-transparent text-on-surface-variant",
      },
    },
    defaultVariants: { selecionado: false },
  }
)

type ChipProps = React.ComponentProps<"button"> & VariantProps<typeof chipVariants>

/** Chip de filtro: mostra o check quando selecionado. */
export function Chip({ selecionado, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={Boolean(selecionado)}
      className={cn(chipVariants({ selecionado }), className)}
      {...props}
    >
      {selecionado && <CheckIcon aria-hidden />}
      {children}
    </button>
  )
}

/** Check do chip selecionado, para chips renderizados como link. */
export function ChipCheck({ visivel }: { visivel: boolean }) {
  return visivel ? <CheckIcon aria-hidden /> : null
}
