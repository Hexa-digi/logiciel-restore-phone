"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Connexion..." : "Acceder au centre de commandement"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, undefined);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 bg-grid-radial" />
      <div className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-aria-cyan/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-aria-violet/10 blur-3xl" />

      <div className="panel-glow hud-border w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-aria-cyan/30 bg-aria-cyan/10 text-2xl font-bold text-aria-cyan shadow-glow">
            N
          </div>
          <h1 className="font-display text-xl font-semibold tracking-wide text-slate-100">NEXUS</h1>
          <p className="mt-1 text-sm text-slate-400">Le centre de commandement de votre entreprise</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="label-field" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              className="input-field"
              placeholder="vous@entreprise.fr"
            />
          </div>
          <div>
            <label className="label-field" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg border border-aria-rose/30 bg-aria-rose/10 px-3 py-2 text-sm text-aria-rose">
              {state.error}
            </p>
          )}

          <SubmitButton />
        </form>
      </div>
    </main>
  );
}
