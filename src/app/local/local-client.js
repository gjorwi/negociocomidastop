"use client";

import { useState } from "react";
import { BadgeCheck, Check } from "lucide-react";
import {
  Button,
  Field,
  Pill,
  SectionTitle,
  Toggle,
} from "@/components/ui";
import { useBusiness } from "@/components/business-provider";

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
  const [saved, setSaved] = useState(false);

  const updateDraft = (key, value) => {
    setSaved(false);
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    await updateBusiness(draft);
    setSaved(true);
  };

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        Perfil público
      </p>
      <h1 className="mt-2 font-display text-[38px] leading-none tracking-[-0.045em] text-ink">
        Mi local
      </h1>
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
          onChange={async (isOpen) => {
            await updateBusiness({ isOpen });
            setDraft((current) => ({ ...current, isOpen }));
          }}
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
          <Field
            label="Dirección"
            value={draft.address}
            onChange={(value) => updateDraft("address", value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Zona"
              value={draft.zone}
              onChange={(value) => updateDraft("zone", value)}
            />
            <Field
              label="Categoría principal"
              value={draft.categoryKey || draft.category}
              onChange={(value) => updateDraft("categoryKey", value)}
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
        <p className="mt-3 text-[11px] leading-5 text-muted">
          Los cambios se publican en la ficha de tu establecimiento al guardar.
        </p>
      </form>
    </div>
  );
}
