import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// Botões Material 3: pílula, rótulo label-large, camada de estado + ripple "Eco".
// Em telas de toque o alvo mínimo é 44px (pointer-coarse), sem mudar o visual no PC.
const buttonVariants = cva(
  "camada-estado group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-transparent type-label-large whitespace-nowrap transition-[background-color,box-shadow,color] duration-200 ease-standard outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-error [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[1.125rem]",
  {
    variants: {
      variant: {
        // filled
        default: "bg-primary text-on-primary hover:shadow-elev-1",
        // tonal
        secondary: "bg-secondary-container text-on-secondary-container hover:shadow-elev-1",
        // outlined
        outline: "border-outline bg-transparent text-primary aria-expanded:bg-secondary-container",
        // padrão (ícones e ações neutras)
        ghost: "bg-transparent text-on-surface-variant aria-expanded:bg-secondary-container aria-expanded:text-on-secondary-container",
        // text
        text: "bg-transparent text-primary",
        destructive: "bg-error-container text-on-error-container",
        link: "text-primary underline underline-offset-4 [&::after]:hidden",
      },
      size: {
        default:
          "h-10 gap-2 px-6 pointer-coarse:min-h-11 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 has-[>svg:first-child]:pl-4",
        xs: "h-7 gap-1 px-3 type-label-medium pointer-coarse:min-h-11 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 px-4 pointer-coarse:min-h-11 has-[>svg:first-child]:pl-3 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-12 gap-2 px-8 type-title-medium has-[>svg:first-child]:pl-6 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-10 pointer-coarse:size-11 [&_svg:not([class*='size-'])]:size-5",
        "icon-xs": "size-7 pointer-coarse:size-11 [&_svg:not([class*='size-'])]:size-4",
        "icon-sm": "size-8 pointer-coarse:size-11 [&_svg:not([class*='size-'])]:size-[1.125rem]",
        "icon-lg": "size-12 [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
