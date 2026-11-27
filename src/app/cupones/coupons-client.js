"use client";

import { useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import {
  Check,
  Gift,
  MapPin,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import {
  Button,
  Field,
  Pill,
  SectionTitle,
  Select,
} from "@/components/ui";

const emptyForm = {
  id: "",
  title: "",
  description: "",
  emoji: "🎁",
  pointsCost: "50",
  stock: "10",
  perUserLimit: "1",
  validityDays: "30",
  availableFrom: "",
  availableUntil: "",
  status: "active",
};

function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusLabel(status) {
  if (status === "active") return "Activo";
  if (status === "paused") return "Pausado";
  if (status === "ended") return "Finalizado";
  return status;
}

function statusTone(status) {
  if (status === "active") return "open";
  if (status === "paused") return "amber";
  return "beige";
}

function purchaseStatusLabel(status) {
  if (status === "activated") return "Por aceptar";
  if (status === "used") return "Aceptado";
  if (status === "rejected") return "Rechazado";
  if (status === "expired") return "Vencido";
  return "Adquirido";
}

export default function CouponsBusinessClient() {
  const { mutate } = useSWRConfig();
  const [tab, setTab] = useState("coupons");
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");

  const {
    data: couponsData,
    error: couponsError,
    isLoading: couponsLoading,
  } = useSWR("/business/me/coupons", apiFetch);
  const {
    data: purchasesData,
    error: purchasesError,
    isLoading: purchasesLoading,
  } = useSWR("/business/me/coupon-purchases?status=todas", apiFetch);

  const coupons = couponsData?.coupons || [];
  const purchases = useMemo(
    () => purchasesData?.purchases || [],
    [purchasesData],
  );
  const pending = useMemo(
    () => purchases.filter((purchase) => purchase.status === "activated"),
    [purchases],
  );
  const history = useMemo(
    () =>
      purchases.filter((purchase) =>
        ["used", "rejected", "expired"].includes(purchase.status),
      ),
    [purchases],
  );

  const openForm = (coupon = null) => {
    setError("");
    setMessage("");
    if (!coupon) {
      setForm({ ...emptyForm });
      return;
    }
    setForm({
      id: coupon.id,
      title: coupon.title,
      description: coupon.description || "",
      emoji: coupon.emoji || "🎁",
      pointsCost: String(coupon.pointsCost),
      stock: String(coupon.stock),
      perUserLimit: String(coupon.perUserLimit),
      validityDays: String(coupon.validityDays),
      availableFrom: toDateInput(coupon.availableFrom),
      availableUntil: toDateInput(coupon.availableUntil),
      status: coupon.status,
    });
  };

  const saveCoupon = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        title: form.title,
        description: form.description,
        emoji: form.emoji,
        pointsCost: Number(form.pointsCost),
        stock: Number(form.stock),
        perUserLimit: Number(form.perUserLimit),
        validityDays: Number(form.validityDays),
        availableFrom: form.availableFrom || null,
        availableUntil: form.availableUntil || null,
        status: form.status,
      };
      await apiFetch(
        form.id ? `/business/me/coupons/${form.id}` : "/business/me/coupons",
        {
          method: form.id ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );
      await mutate("/business/me/coupons");
      setForm(null);
      setMessage("Cupón guardado correctamente.");
    } catch (saveError) {
      setError(saveError.message || "No se pudo guardar el cupón.");
    } finally {
      setSaving(false);
    }
  };

  const acceptPurchase = async (purchase) => {
    if (busyId) return;
    setBusyId(purchase.id);
    setError("");
    setMessage("");
    try {
      await apiFetch(
        `/business/me/coupon-purchases/${purchase.id}/accept`,
        { method: "POST" },
      );
      await mutate("/business/me/coupon-purchases?status=todas");
      await mutate("/business/me/coupons");
      setMessage("Canje aceptado. El cupón quedó cerrado.");
    } catch (acceptError) {
      setError(acceptError.message || "No se pudo aceptar el canje.");
    } finally {
      setBusyId("");
    }
  };

  const rejectPurchase = async (purchase) => {
    if (busyId) return;
    if (
      !window.confirm(
        "¿Rechazar este canje? Se devolverán los puntos al cliente, pero el stock no se repondrá.",
      )
    ) {
      return;
    }
    setBusyId(purchase.id);
    setError("");
    setMessage("");
    try {
      await apiFetch(
        `/business/me/coupon-purchases/${purchase.id}/reject`,
        { method: "POST" },
      );
      await mutate("/business/me/coupon-purchases?status=todas");
      await mutate("/business/me/coupons");
      setMessage("Canje rechazado. Los puntos fueron devueltos al cliente.");
    } catch (rejectError) {
      setError(rejectError.message || "No se pudo rechazar el canje.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        Fidelización
      </p>
      <h1 className="mt-2 font-display text-[38px] leading-none tracking-[-0.045em] text-ink">
        Cupones
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Crea cupones para tus clientes, revisa las activaciones cerca del local
        y acepta o rechaza los canjes.
      </p>

      {error || couponsError || purchasesError ? (
        <div className="mt-5 rounded-[20px] bg-accent-tint p-4 text-sm font-semibold text-accent">
          {error ||
            couponsError?.message ||
            purchasesError?.message ||
            "No se pudo cargar la información."}
        </div>
      ) : null}

      {message ? (
        <div className="mt-4 rounded-[20px] bg-green-tint p-4 text-sm font-semibold text-open">
          {message}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("coupons")}
          className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
            tab === "coupons"
              ? "bg-ink text-white"
              : "bg-beige text-ink hover:bg-[#ebe0d4]"
          }`}
        >
          <Gift className="h-4 w-4" aria-hidden="true" />
          Mis cupones
        </button>
        <button
          type="button"
          onClick={() => setTab("redemptions")}
          className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
            tab === "redemptions"
              ? "bg-ink text-white"
              : "bg-beige text-ink hover:bg-[#ebe0d4]"
          }`}
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          Canjes
          {pending.length ? (
            <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-white">
              {pending.length}
            </span>
          ) : null}
        </button>
      </div>

      {tab === "coupons" ? (
        <section className="mt-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-[24px] leading-tight tracking-[-0.03em] text-ink">
                Tus cupones
              </h2>
              <p className="mt-1 text-sm text-muted">
                Cada cupón pertenece a este negocio y descuenta puntos al
                adquirirse.
              </p>
            </div>
            <Button type="button" onClick={() => openForm()}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nuevo cupón
            </Button>
          </div>

          {form ? (
            <form
              onSubmit={saveCoupon}
              className="mt-4 rounded-[24px] border border-line/70 bg-white p-4 shadow-sm"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Título"
                  value={form.title}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, title: value }))
                  }
                  placeholder="Postre gratis"
                />
                <Field
                  label="Emoji"
                  value={form.emoji}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, emoji: value }))
                  }
                  placeholder="🎁"
                />
              </div>
              <div className="mt-3">
                <Field
                  label="Descripción"
                  value={form.description}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      description: value,
                    }))
                  }
                  placeholder="Qué incluye y condiciones del cupón"
                  multiline
                />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Field
                  label="Costo en puntos"
                  type="number"
                  value={form.pointsCost}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, pointsCost: value }))
                  }
                />
                <Field
                  label="Stock"
                  type="number"
                  value={form.stock}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, stock: value }))
                  }
                />
                <Field
                  label="Límite por cliente"
                  type="number"
                  value={form.perUserLimit}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      perUserLimit: value,
                    }))
                  }
                />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Field
                  label="Días de validez"
                  type="number"
                  value={form.validityDays}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      validityDays: value,
                    }))
                  }
                />
                <Field
                  label="Disponible desde"
                  type="date"
                  value={form.availableFrom}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      availableFrom: value,
                    }))
                  }
                />
                <Field
                  label="Disponible hasta"
                  type="date"
                  value={form.availableUntil}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      availableUntil: value,
                    }))
                  }
                />
              </div>
              <div className="mt-3">
                <Select
                  label="Estado"
                  value={form.status}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, status: value }))
                  }
                >
                  <option value="active">Activo</option>
                  <option value="paused">Pausado</option>
                  <option value="ended">Finalizado</option>
                </Select>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setForm(null)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? "Guardando…" : "Guardar cupón"}
                </Button>
              </div>
            </form>
          ) : null}

          {couponsLoading ? (
            <div className="mt-4 rounded-[24px] bg-soft p-6 text-center text-sm text-muted">
              Cargando cupones…
            </div>
          ) : coupons.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {coupons.map((coupon) => (
                <article
                  key={coupon.id}
                  className="rounded-[24px] border border-line/70 bg-white/70 p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-tint text-[24px]">
                      {coupon.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="text-sm font-semibold text-ink">
                          {coupon.title}
                        </h3>
                        <Pill tone={statusTone(coupon.status)}>
                          {statusLabel(coupon.status)}
                        </Pill>
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        {coupon.pointsCost} puntos · {coupon.stock} disponibles
                      </p>
                      <p className="mt-1 text-[11px] text-muted">
                        Adquiridos: {coupon.stats?.acquired || 0} · Activados:{" "}
                        {coupon.stats?.activated || 0} · Usados:{" "}
                        {coupon.stats?.used || 0}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openForm(coupon)}
                      className="rounded-full bg-white p-2 text-muted shadow-sm transition hover:text-accent"
                      aria-label={`Editar ${coupon.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[24px] bg-soft p-6 text-center text-sm text-muted">
              Todavía no tienes cupones. Crea el primero.
            </div>
          )}
        </section>
      ) : (
        <section className="mt-5">
          <SectionTitle
            title="Canjes por aceptar"
            description="El cliente ya activó el cupón cerca del local."
          />
          {purchasesLoading ? (
            <div className="rounded-[24px] bg-soft p-6 text-center text-sm text-muted">
              Cargando canjes…
            </div>
          ) : pending.length ? (
            <div className="grid gap-3">
              {pending.map((purchase) => (
                <article
                  key={purchase.id}
                  className="rounded-[24px] border border-line/70 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-tint text-sm font-bold text-accent">
                      {purchase.client.name
                        .split(" ")
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">
                        {purchase.client.name}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {purchase.client.email}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {purchase.coupon.emoji} {purchase.coupon.title} ·{" "}
                        {purchase.pointsSpent} puntos
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-muted">
                    <MapPin className="h-3.5 w-3.5" />
                    Activado {formatDate(purchase.activatedAt)}
                    {typeof purchase.activationDistanceMeters === "number"
                      ? ` · a ${purchase.activationDistanceMeters} m`
                      : ""}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      type="button"
                      onClick={() => acceptPurchase(purchase)}
                      disabled={busyId === purchase.id}
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Aceptar canje
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => rejectPurchase(purchase)}
                      disabled={busyId === purchase.id}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                      Rechazar
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] bg-soft p-6 text-center text-sm text-muted">
              No hay canjes activados pendientes.
            </div>
          )}

          <SectionTitle title="Historial" />
          {history.length ? (
            <div className="overflow-hidden rounded-[24px] border border-line/70 bg-white/70 shadow-sm">
              {history.map((purchase, index) => (
                <div
                  key={purchase.id}
                  className={`flex flex-wrap items-center gap-3 px-4 py-3 ${
                    index > 0 ? "border-t border-line" : ""
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {purchase.coupon.title}
                    </span>
                    <span className="block text-[11px] text-muted">
                      {purchase.client.name} · {purchase.client.email}
                    </span>
                  </span>
                  <Pill
                    tone={
                      purchase.status === "used"
                        ? "open"
                        : purchase.status === "rejected"
                          ? "red"
                          : "beige"
                    }
                  >
                    {purchaseStatusLabel(purchase.status)}
                  </Pill>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] bg-soft p-6 text-center text-sm text-muted">
              Aún no hay historial de canjes.
            </div>
          )}
        </section>
      )}
    </div>
  );
}
