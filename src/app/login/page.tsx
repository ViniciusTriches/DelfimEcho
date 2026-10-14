import type { Metadata } from "next";
import { Marca } from "@/components/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

/** Anéis do eco atrás da marca: o sinal que sai e volta. Decorativo. */
function Ecos() {
  return (
    <svg viewBox="0 0 200 200" aria-hidden className="absolute inset-0 size-full text-outline-variant">
      {[38, 62, 86].map((r, i) => (
        <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="currentColor" strokeWidth={1.5 - i * 0.35} opacity={1 - i * 0.28} />
      ))}
    </svg>
  );
}

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-sm flex-col items-center">
        <div className="relative mb-2 flex size-44 items-center justify-center">
          <Ecos />
          <span className="relative flex size-16 items-center justify-center rounded-full bg-primary-container">
            <Marca className="size-9 text-on-primary-container" />
          </span>
        </div>
        <h1 className="type-headline-medium text-on-surface">Echo</h1>
        <p className="mt-1 mb-8 max-w-[18rem] text-center type-body-medium text-on-surface-variant">
          Registre a prática. O Echo devolve onde você está evoluindo.
        </p>

        <section aria-labelledby="titulo-entrar" className="w-full rounded-2xl bg-surface-container-low p-6 sm:p-8">
          <h2 id="titulo-entrar" className="mb-6 type-title-large text-on-surface">
            Entrar
          </h2>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
