"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { BadgeCheck, Camera, Check, LocateFixed, X } from "lucide-react";
import {
  Button,
  Field,
  Pill,
  SectionTitle,
  Toggle,
} from "@/components/ui";
import { LocationPicker } from "@/components/location-picker";
import { useBusiness } from "@/components/business-provider";
import { compressImage } from "@/lib/image";
import { reverseGeocode } from "@/lib/geo";

export default function BusinessProfileClient() {
  const { business, updateBusiness } = useBusiness();

  if (!business) {
    return (
      <div className="rounded-[24px] bg-soft p-8 text-center text-sm text-muted">
        Cargando perfil…
      </div>
    );
  }

  return (
    <ProfileForm
      key={business.id}
      business={business}
      updateBusiness={updateBusiness}
    />
  );
}

function ProfileForm({ business, updateBusiness }) {
  const [draft, setDraft] = useState(() => ({ ...business }));
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    JSON.stringify(business),
  );
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [imageError, setImageError] = useState("");
  const [logoError, setLogoError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [locating, setLocating] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== savedSnapshot,
    [draft, savedSnapshot],
  );

  useEffect(() => {
    if (!dirty) return undefined;
    const warnBeforeLeaving = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [dirty]);

  const updateDraft = (key, value) => {
    setSaved(false);
    setSaveError("");
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const applyLocation = (point) => {
    setLocationError("");
    updateDraft("location", point);
    setAddressLoading(true);
    reverseGeocode(point)
      .then((address) => {
        if (address) updateDraft("address", address);
      })
      .catch(() => {})
      .finally(() => setAddressLoading(false));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Tu navegador no permite obtener la ubicación. Márcala en el mapa.",
      );
      return;
    }

    setLocationError("");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        applyLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setLocating(false);
        setLocationError(
          "No pudimos obtener tu ubicación. Revisa los permisos del navegador o márcala en el mapa.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const onCoverChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImageError("");
    try {
      const image = await compressImage(file);
      updateDraft("coverImage", image);
    } catch (error) {
      setImageError(error.message);
    }
  };

  const onLogoChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setLogoError("");
    try {
      const image = await compressImage(file);
      updateDraft("logoImage", image);
    } catch (error) {
      setLogoError(error.message);
    }
  };

  const persist = async () => {
    const deliveryEnabled = Boolean(draft.hasDelivery);
    const toOptionalNumber = (value) => {
      if (value === "" || value === null || value === undefined) return null;
      const numeric = Number(value);
      return Number.isFinite(numeric) ? numeric : null;
    };

    try {
      await updateBusiness({
        ...draft,
        hasDelivery: deliveryEnabled,
        deliveryShortFee: deliveryEnabled
          ? toOptionalNumber(draft.deliveryShortFee)
          : null,
        deliveryLongFee: deliveryEnabled
          ? toOptionalNumber(draft.deliveryLongFee)
          : null,
        freeDeliveryFrom: deliveryEnabled
          ? toOptionalNumber(draft.freeDeliveryFrom)
          : null,
      });
      setSavedSnapshot(JSON.stringify(draft));
      setSaved(true);
      setSaveError("");
    } catch (error) {
      setSaved(false);
      setSaveError(
        error.message || "No pudimos guardar los cambios. Intenta de nuevo.",
      );
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    await persist();
  };

  const changeOpenStatus = async (isOpen) => {
    await updateBusiness({ isOpen });
    setDraft((current) => ({ ...current, isOpen }));
    setSavedSnapshot((current) => {
      const baseline = JSON.parse(current);
      baseline.isOpen = isOpen;
      return JSON.stringify(baseline);
    });
  };

  const hasLocation =
    typeof draft.location?.lat === "number" &&
    Number.isFinite(draft.location.lat) &&
    typeof draft.location?.lng === "number" &&
    Number.isFinite(draft.location.lng);

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        Perfil público
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h1 className="font-display text-[38px] leading-none tracking-[-0.045em] text-ink">
          Mi local
        </h1>
        {dirty ? <Pill tone="amber">Cambios sin guardar</Pill> : null}
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Mantén al día los datos que ayudan a tus clientes a encontrarte.
      </p>

      <section className="mt-5 flex flex-col gap-3 rounded-[24px] bg-green-tint p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">
            Estado del establecimiento
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {business.isOpen
              ? "Aparece abierto ahora"
              : "Aparece cerrado ahora"}
          </p>
        </div>
        <Toggle
          checked={business.isOpen}
          onChange={changeOpenStatus}
          label="Estado abierto del establecimiento"
        />
      </section>

      <section className="mt-3 flex gap-3 rounded-[24px] bg-white p-4 shadow-sm">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-tint">
          <BadgeCheck className="h-5 w-5 text-open" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">
            Datos del local verificados
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            La verificación confirma información, no es una puntuación de
            calidad.
          </p>
        </div>
        <Pill tone="open">Sistema</Pill>
      </section>

      <section className="mt-3 rounded-[24px] bg-white p-4 shadow-sm sm:p-5">
        <h2 className="font-display text-xl tracking-[-0.03em] text-ink">
          Foto de portada
        </h2>
        <p className="mt-1 text-xs leading-5 text-muted">
          Es la imagen principal que ven los clientes al abrir tu ficha.
        </p>
        {draft.coverImage ? (
          <div className="relative mt-3 h-48 overflow-hidden rounded-[20px] bg-accent-tint sm:h-60">
            <Image
              src={draft.coverImage}
              alt={`Portada de ${draft.name}`}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => updateDraft("coverImage", "")}
              aria-label="Quitar foto de portada"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink shadow-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="mt-3 flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-line bg-soft text-sm font-semibold text-muted transition hover:border-accent/50 hover:text-accent">
            <Camera className="h-6 w-6" aria-hidden="true" />
            Elegir foto de portada
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onCoverChange}
              className="sr-only"
            />
          </label>
        )}
        {draft.coverImage ? (
          <label className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-accent hover:underline">
            Cambiar foto
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onCoverChange}
              className="sr-only"
            />
          </label>
        ) : null}
        {imageError ? (
          <p className="mt-2 text-xs font-semibold text-accent">{imageError}</p>
        ) : null}
      </section>

      <section className="mt-3 rounded-[24px] bg-white p-4 shadow-sm sm:p-5">
        <h2 className="font-display text-xl tracking-[-0.03em] text-ink">
          Logo del negocio
        </h2>
        <p className="mt-1 text-xs leading-5 text-muted">
          Se muestra en un círculo sobre tu portada y en las promociones
          destacadas. Usa una imagen cuadrada.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          {draft.logoImage ? (
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-accent-tint ring-4 ring-beige">
              <Image
                src={draft.logoImage}
                alt={`Logo de ${draft.name}`}
                width={96}
                height={96}
                unoptimized
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-accent-tint text-[40px] ring-4 ring-beige">
              {draft.emoji || "🍽️"}
            </span>
          )}
          <div className="flex flex-col items-start gap-2">
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-beige px-4 text-xs font-semibold text-ink transition hover:bg-[#ebe0d4]">
              <Camera className="h-4 w-4 text-accent" aria-hidden="true" />
              {draft.logoImage ? "Cambiar logo" : "Subir logo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onLogoChange}
                className="sr-only"
              />
            </label>
            {draft.logoImage ? (
              <button
                type="button"
                onClick={() => updateDraft("logoImage", "")}
                className="text-xs font-semibold text-accent hover:underline"
              >
                Quitar logo
              </button>
            ) : (
              <p className="text-[11px] leading-4 text-muted">
                JPG, PNG o WebP. Se recorta en círculo.
              </p>
            )}
          </div>
        </div>
        {logoError ? (
          <p className="mt-2 text-xs font-semibold text-accent">{logoError}</p>
        ) : null}
      </section>

      <form onSubmit={saveProfile} className="mt-6 max-w-3xl">
        <SectionTitle
          title="Información pública"
          description="Estos datos aparecen en la ficha del establecimiento."
        />
        <div className="space-y-4 rounded-[24px] bg-white p-4 shadow-sm sm:p-5">
          <Field
            label="Nombre del establecimiento"
            value={draft.name}
            onChange={(value) => updateDraft("name", value)}
          />
          <Field
            label="Descripción"
            value={draft.description}
            onChange={(value) => updateDraft("description", value)}
            multiline
          />
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-soft px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">
                ¿Ofrece servicio de delivery?
              </p>
              <p className="mt-0.5 text-xs text-muted">
                Se muestra en tu ficha pública.
              </p>
            </div>
            <Toggle
              checked={Boolean(draft.hasDelivery)}
              onChange={(value) => updateDraft("hasDelivery", value)}
              label="El negocio ofrece servicio de delivery"
            />
          </div>
          {draft.hasDelivery ? (
            <div className="space-y-4 rounded-2xl bg-soft p-4">
              <div>
                <p className="text-sm font-semibold text-ink">
                  Tarifas de delivery
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  Se muestran en tu ficha pública para que el cliente conozca el
                  costo antes de pedir.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Delivery corto (USD)"
                  type="number"
                  value={
                    draft.deliveryShortFee === null ||
                    draft.deliveryShortFee === undefined
                      ? ""
                      : String(draft.deliveryShortFee)
                  }
                  onChange={(value) => updateDraft("deliveryShortFee", value)}
                  placeholder="Ej. 1.50"
                  helper="Opcional. Zonas cercanas."
                />
                <Field
                  label="Delivery largo (USD)"
                  type="number"
                  value={
                    draft.deliveryLongFee === null ||
                    draft.deliveryLongFee === undefined
                      ? ""
                      : String(draft.deliveryLongFee)
                  }
                  onChange={(value) => updateDraft("deliveryLongFee", value)}
                  placeholder="Ej. 3.00"
                  helper="Opcional. Zonas más lejanas."
                />
              </div>
              <Field
                label="Delivery gratis a partir de (USD)"
                type="number"
                value={
                  draft.freeDeliveryFrom === null ||
                  draft.freeDeliveryFrom === undefined
                    ? ""
                    : String(draft.freeDeliveryFrom)
                }
                onChange={(value) => updateDraft("freeDeliveryFrom", value)}
                placeholder="Ej. 15.00"
                helper="Opcional. Déjalo vacío si no aplica."
              />
            </div>
          ) : null}
        </div>

        <SectionTitle
          title="Ubicación"
          description="Marca el punto exacto del local para la ficha pública y la validación del QR."
        />
        <div className="space-y-4 rounded-[24px] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={locating}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-beige px-4 text-sm font-semibold text-ink transition hover:bg-[#ebe0d4] disabled:opacity-60"
            >
              <LocateFixed className="h-4 w-4 text-accent" aria-hidden="true" />
              {locating ? "Obteniendo ubicación…" : "Usar mi ubicación actual"}
            </button>
            <p className="text-[11px] leading-4 text-muted">
              Toca el mapa o arrastra el marcador para ajustar la ubicación.
            </p>
          </div>

          <LocationPicker
            value={hasLocation ? draft.location : null}
            onChange={applyLocation}
          />

          {hasLocation ? (
            <p className="text-[11px] font-semibold text-open">
              Ubicación marcada: {draft.location.lat.toFixed(5)},{" "}
              {draft.location.lng.toFixed(5)}
            </p>
          ) : (
            <p className="rounded-2xl bg-amber-tint p-3 text-[11px] font-semibold leading-4 text-[#6a4700]">
              Aún no hay una ubicación marcada. Sin ella, los clientes no podrán
              validar el escaneo del QR.
            </p>
          )}

          {locationError ? (
            <p className="text-xs font-semibold text-accent">{locationError}</p>
          ) : null}

          <Field
            label="Dirección"
            value={draft.address}
            onChange={(value) => updateDraft("address", value)}
            helper={
              addressLoading
                ? "Buscando la dirección del punto marcado…"
                : "Se completa desde el mapa. Puedes editarla."
            }
          />
          <Field
            label="Referencia de ubicación"
            value={draft.locationReference || ""}
            onChange={(value) => updateDraft("locationReference", value)}
            placeholder="Ej. Cerca del estadio municipal, al lado de la policía"
            helper="Opcional. Describe puntos de referencia para que tus clientes lleguen más fácil."
            multiline
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Municipio"
              value={draft.municipality || ""}
              onChange={(value) => updateDraft("municipality", value)}
            />
            <Field
              label="Parroquia"
              value={draft.parish || ""}
              onChange={(value) => updateDraft("parish", value)}
            />
            <Field
              label="Sector (opcional)"
              value={draft.sector || ""}
              onChange={(value) => updateDraft("sector", value)}
            />
          </div>
        </div>

        <SectionTitle title="Contacto y horario" />
        <div className="space-y-4 rounded-[24px] bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Teléfono"
              value={draft.phone}
              onChange={(value) => updateDraft("phone", value)}
            />
            <Field
              label="WhatsApp con código de país"
              value={draft.whatsapp}
              onChange={(value) => updateDraft("whatsapp", value)}
            />
          </div>
          <Field
            label="Horario publicado"
            value={draft.hours}
            onChange={(value) => updateDraft("hours", value)}
          />
        </div>

        {business.recognition?.status === "validado" ? (
          <section className="mt-4 flex gap-3 rounded-[24px] bg-amber-tint p-4">
            <span className="text-[28px]">🏅</span>
            <div>
              <p className="text-sm font-semibold text-[#5c3d00]">
                Reconocimiento emitido por comidasTop
              </p>
              <p className="mt-1 text-xs text-[#6a4700]">
                Top {business.recognition.position} de{" "}
                {business.recognition.category.toLowerCase()} en{" "}
                {business.recognition.city}
              </p>
              <p className="mt-1.5 text-[10px] text-[#8a5a00]">
                No se puede editar ni comprar.
              </p>
            </div>
          </section>
        ) : null}

        <div className="mt-5 flex items-center gap-3">
          <Button type="submit">Guardar cambios</Button>
          {saved ? (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-open">
              <Check className="h-4 w-4" />
              Guardado
            </span>
          ) : null}
        </div>
        {saveError ? (
          <p className="mt-2 text-xs font-semibold text-accent">{saveError}</p>
        ) : null}
        <p className="mt-3 text-[11px] leading-5 text-muted">
          La portada, el logo y los cambios se publican en tu ficha al guardar.
        </p>
      </form>

      {dirty ? (
        <div
          role="status"
          className="fixed inset-x-4 bottom-4 z-50 rounded-[20px] bg-ink p-3 text-white shadow-xl sm:left-auto sm:right-6 sm:w-[340px]"
        >
          <p className="text-xs font-semibold">Tienes cambios sin guardar</p>
          <p className="mt-0.5 text-[11px] leading-4 text-white/70">
            Guárdalos para que se publiquen en la ficha del negocio.
          </p>
          <button
            type="button"
            onClick={persist}
            className="mt-2 inline-flex min-h-10 w-full items-center justify-center rounded-full bg-white px-4 text-xs font-semibold text-ink transition hover:bg-white/90"
          >
            Guardar cambios
          </button>
        </div>
      ) : null}
    </div>
  );
}
