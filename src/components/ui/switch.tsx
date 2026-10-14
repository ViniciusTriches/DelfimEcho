"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "cn"

// Switch Material 3: trilho 52×32; desligado = contorno + polegar 16px; ligado = primária + polegar 24px.
function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer group/switch relative inline-flex h-8 w-[3.25rem] shrink-0 cursor-pointer items-center rounded-full border-2 transition-[background-color,border-color] duration-200 ease-standard outline-none",
        "after:absolute after:-inset-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "data-unchecked:border-outline data-unchecked:bg-surface-container-highest data-checked:border-primary data-checked:bg-primary",
        "data-disabled:cursor-not-allowed data-disabled:opacity-40",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full transition-[transform,width,height,background-color] duration-200 ease-emphasized-decelerate motion-reduce:transition-none",
          "data-unchecked:size-4 data-unchecked:translate-x-1.5 data-unchecked:bg-outline",
          "data-checked:size-6 data-checked:translate-x-[1.375rem] data-checked:bg-on-primary",
          "group-active/switch:data-unchecked:size-7 group-active/switch:data-checked:size-7"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
