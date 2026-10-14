import { CircleAlertIcon } from "lucide-react";

/** Erro de envio de formulário, em container de erro M3. */
export function ErroFormulario({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-md bg-error-container px-4 py-3 type-body-medium text-on-error-container"
    >
      <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
      {children}
    </p>
  );
}
