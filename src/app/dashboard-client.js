"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Star, Store } from "lucide-react";
import { Pill, RatingLine, SectionTitle, Toggle } from "@/components/ui";
import { useBusiness } from "@/components/business-provider";
import { formatScore, MIN_RATINGS_FOR_RANKING } from "@/lib/scoring";

export default function DashboardClient() {
  const { business, products, metrics, updateBusiness } = useBusiness();

  if (!business) {
    return (
      <div className="rounded-[24px] bg-soft p-8 text-center text-sm text-muted">
        Cargando negocio…
      </div>
    );
  }

  const topProducts = [...products]
    .filter((product) => product.ratingsCount >= MIN_RATINGS_FOR_RANKING)
    .sort(
      (a, b) =>
        (b.score || 0) - (a.score || 0) ||
        (b.ratingsCount || 0) - (a.ratingsCount || 0),
    )
    .slice(0, 3);

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        Hola, {business.name}
      </p>
      <h1 className="mt-2 font-display text-[38px] leading-none tracking-[-0.045em] text-ink">
        Tu local, al día.
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Administra lo que ven tus clientes y consulta cómo se puntúan tus
        platos.
      </p>

      <section className="mt-6 flex flex-col gap-4 rounded-[24px] bg-green-tint p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Pill tone={business.isOpen ? "open" : "dark"}>
            {business.isOpen ? "Abierto ahora" : "Cerrado"}
          </Pill>
          <p className="mt-2 text-sm font-semibold text-ink">
            {business.isOpen
              ? "El local aparece abierto para clientes"
              : "El local aparece cerrado para clientes"}
          </p>
          <p className="mt-1 text-xs text-muted">
            Cambia el estado visible desde aquí.
          </p>
        </div>
        <Toggle
          checked={business.isOpen}
          onChange={(isOpen) => updateBusiness({ isOpen })}
          label="Estado abierto del establecimiento"
        />
      </section>

      <section className="mt-4 overflow-hidden rounded-[28px] bg-accent p-5 text-white sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-white/70">Puntuación calculada</p>
            <div className="mt-1 flex items-end gap-1.5">
              <Star className="mb-2 h-7 w-7 fill-mustard text-mustard" />
              <span className="font-display text-[52px] leading-none">
                {formatScore(metrics.score)}
              </span>
              <span className="mb-2 text-sm text-white/70">/ 5</span>
            </div>
          </div>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <Sparkles className="h-7 w-7" />
          </span>
        </div>

        <div className="my-5 h-px bg-white/20" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-display text-2xl">
              {metrics.ratedProducts}/{metrics.activeProducts}
            </p>
            <p className="text-[11px] text-white/70">platos puntuados</p>
          </div>
          <div className="border-l border-white/20 pl-4">
            <p className="font-display text-2xl">{metrics.ratingsCount}</p>
            <p className="text-[11px] text-white/70">puntuaciones</p>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-xs leading-5 text-white/75">
          Media de los platos puntuados, con ajuste por cantidad de datos. No se
          reciben puntuaciones directas al establecimiento.
        </p>
      </section>

      {business.recognition?.status === "validado" ? (
        <section className="mt-4 flex gap-3 rounded-[24px] bg-amber-tint p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[25px]">
            🏅
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a5a00]">
              Reconocimiento del sistema
            </p>
            <p className="mt-1 font-display text-xl tracking-[-0.03em] text-[#5c3d00]">
              Top {business.recognition.position} de{" "}
              {business.recognition.category.toLowerCase()}
            </p>
            <p className="mt-0.5 text-xs text-[#6a4700]">
              {business.recognition.productName} · {business.recognition.city}
            </p>
            <p className="mt-1.5 text-[10px] text-[#8a5a00]">
              Distintivo validado y emitido automáticamente
            </p>
          </div>
        </section>
      ) : null}

      <SectionTitle
        title="Tus platos mejor puntuados"
        description="Ordenados por la puntuación ajustada de cada plato."
        action="Administrar"
        href="/menu"
      />

      {topProducts.length ? (
        <div className="overflow-hidden rounded-[24px] bg-white px-4 shadow-sm">
          {topProducts.map((product, index) => (
            <Link
              key={product.id}
              href="/menu"
              className={`flex items-center gap-3 py-3.5 ${
                index > 0 ? "border-t border-line" : ""
              }`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-tint text-[24px]">
                {product.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">
                  {product.name}
                </p>
                <p className="text-xs text-muted">
                  {product.ratingsCount} puntuaciones ·{" "}
                  {product.isAvailable ? "Disponible" : "Agotado hoy"}
                </p>
              </div>
              <RatingLine score={product.score} count={undefined} compact />
              {index === 0 ? <Pill tone="amber">Top</Pill> : null}
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] bg-soft p-5">
          <p className="text-sm font-semibold text-ink">
            Todavía no hay suficientes puntuaciones
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Los platos se mostrarán aquí cuando tengan al menos{" "}
            {MIN_RATINGS_FOR_RANKING} puntuaciones.
          </p>
        </div>
      )}

      <SectionTitle title="Por categoría" />
      <div className="grid gap-2 sm:grid-cols-2">
        {metrics.categoryScores.map((category) => (
          <div
            key={category.id}
            className="flex min-h-14 items-center justify-between rounded-2xl bg-white px-4 shadow-sm"
          >
            <div>
              <p className="text-sm font-semibold text-ink">{category.label}</p>
              <p className="text-[11px] text-muted">
                {category.productsCount} platos puntuados
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
              <Star className="h-4 w-4 fill-mustard text-mustard" />
              {formatScore(category.score)}
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/local"
        className="mt-5 flex min-h-[76px] items-center gap-3 rounded-[24px] bg-beige p-4 transition hover:bg-[#ebe0d4]"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70">
          <Store className="h-5 w-5 text-accent" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">
            Revisa la información de tu local
          </span>
          <span className="block text-xs text-muted">
            Horario, contacto y dirección
          </span>
        </span>
        <ArrowRight className="h-5 w-5 text-accent" />
      </Link>

      <p className="mt-6 text-center text-[11px] leading-5 text-muted">
        Las puntuaciones son de solo lectura y se calculan con las calificaciones
        de tus clientes.
      </p>
    </div>
  );
}
