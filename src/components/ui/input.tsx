import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-12 py-2 file:inline-flex file:h-6 file:border-0 file:bg-transparent file:type-label-large file:text-on-surface w-full min-w-0 rounded-md border border-outline bg-surface-container-lowest px-4 type-body-large text-on-surface transition-[border-color,box-shadow] duration-150 ease-standard outline-none placeholder:text-on-surface-variant/80 hover:border-on-surface focus-visible:border-primary focus-visible:shadow-[inset_0_0_0_1px_var(--md-primary)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-error aria-invalid:shadow-[inset_0_0_0_1px_var(--md-error)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
