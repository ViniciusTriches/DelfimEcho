import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 py-3 w-full min-w-0 rounded-md border border-outline bg-surface-container-lowest px-4 type-body-large text-on-surface transition-[border-color,box-shadow] duration-150 ease-standard outline-none placeholder:text-on-surface-variant/80 hover:border-on-surface focus-visible:border-primary focus-visible:shadow-[inset_0_0_0_1px_var(--md-primary)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-error aria-invalid:shadow-[inset_0_0_0_1px_var(--md-error)]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
