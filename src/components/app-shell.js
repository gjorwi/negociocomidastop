"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LayoutDashboard, LogOut, Store, UtensilsCrossed } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

const navigation = [
  { href: "/", label: "Resumen", icon: LayoutDashboard },
  { href: "/menu", label: "Menú", icon: UtensilsCrossed },
  { href: "/local", label: "Mi local", icon: Store },
];

function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function AppShell({ children }) {
  const pathname = usePathname();
  const { user, business, ready, logout } = useAuth();

  if (pathname === "/login") {
    return <main className="min-h-dvh">{children}</main>;
  }

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-soft text-sm text-muted">
        Cargando panel…
      </div>
    );
  }

  if (!user || user.role !== "business") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-soft px-4">
        <div className="w-full max-w-md rounded-[28px] border border-line bg-white p-7 text-center shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            Acceso de negocios
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-[-0.04em] text-ink">
            Inicia sesión
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Necesitas credenciales aprobadas por el administrador para
            administrar tu establecimiento.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <Link
            href="/"
            aria-label="comidasTop negocios, ir al resumen"
            className="flex shrink-0 items-center gap-2 font-display text-[24px] leading-none tracking-[-0.055em] sm:gap-2.5 sm:text-[26px]"
          >
            <Image
              src="/logo.jpg"
              alt=""
              width={40}
              height={40}
              priority
              className="h-8 w-8 shrink-0 rounded-full object-contain sm:h-10 sm:w-10"
            />
            <span>
              <span className="text-ink">comidas</span>
              <span className="text-accent">Top</span>
            </span>
          </Link>

          <nav
            aria-label="Navegación del negocio"
            className="hidden items-center gap-1 md:flex"
          >
            {navigation.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
                    active
                      ? "bg-accent text-white"
                      : "text-muted hover:bg-beige hover:text-ink"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden max-w-[180px] truncate text-xs font-medium text-muted sm:block">
              {business?.name || user.name}
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-beige text-xs font-bold text-accent">
              {String(business?.name || user.name)
                .split(" ")
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase()}
            </span>
            <button
              type="button"
              onClick={logout}
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition hover:bg-beige hover:text-ink"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 md:pb-14">
        {children}
      </main>

      <nav
        aria-label="Navegación inferior del negocio"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white px-2 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 md:hidden"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-between gap-1">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex min-h-[58px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-semibold transition ${
                  active
                    ? "bg-accent text-white"
                    : "text-muted hover:bg-soft hover:text-ink"
                }`}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
