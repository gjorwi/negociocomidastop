"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LockKeyhole } from "lucide-react";
import { Button, Field } from "@/components/ui";
import { useAuth } from "@/components/auth-provider";

export default function LoginClient() {
  const router = useRouter();
  const { login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = await login(email.trim(), password);
      if (!payload.business) {
        logout();
        setError("Esta cuenta no tiene un negocio asociado.");
        return;
      }
      router.replace("/");
    } catch (loginError) {
      setError(loginError.message || "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-soft px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-5 text-center">
          <div className="flex items-center justify-center gap-2.5 font-display text-[30px] leading-none tracking-[-0.055em]">
            <Image
              src="/logo.jpg"
              alt=""
              width={48}
              height={48}
              priority
              className="h-12 w-12 rounded-full object-contain"
            />
            <span>
              <span className="text-ink">comidas</span>
              <span className="text-accent">Top</span>
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Panel de negocios
          </p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-[28px] border border-line bg-white p-6 shadow-sm"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-tint">
            <LockKeyhole className="h-5 w-5 text-accent" />
          </span>
          <h1 className="mt-4 font-display text-3xl tracking-[-0.04em] text-ink">
            Iniciar sesión
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-muted">
            Usa las credenciales aprobadas por el administrador de comidasTop.
          </p>

          <div className="mt-5 space-y-4">
            <Field
              label="Correo"
              value={email}
              onChange={setEmail}
              type="email"
              placeholder="negocio@correo.com"
            />
            <Field
              label="Contraseña"
              value={password}
              onChange={setPassword}
              type="password"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <p className="mt-4 rounded-2xl bg-accent-tint p-3 text-xs font-semibold leading-5 text-accent">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            className="mt-5 w-full"
            disabled={loading || !email || !password}
          >
            {loading ? "Ingresando…" : "Entrar al panel"}
          </Button>
        </form>
      </div>
    </div>
  );
}
