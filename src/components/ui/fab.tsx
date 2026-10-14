import { cva, type VariantProps } from "class-variance-authority"

// FAB Material 3: primary-container, cantos de 16px, elevação 3. Use em Link ou button.
export const fabVariants = cva(
  "camada-estado inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg bg-primary-container text-on-primary-container shadow-elev-3 transition-shadow duration-200 ease-standard outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&_svg]:size-6 [&_svg]:shrink-0",
  {
    variants: {
      tamanho: {
        estendido: "h-14 gap-3 pr-5 pl-4 type-label-large",
        icone: "size-14",
      },
    },
    defaultVariants: { tamanho: "estendido" },
  }
)

export type FabVariants = VariantProps<typeof fabVariants>
