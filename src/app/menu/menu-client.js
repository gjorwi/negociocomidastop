"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, X } from "lucide-react";
import {
  Button,
  Field,
  Pill,
  ProductCard,
  SectionTitle,
  Select,
  Toggle,
} from "@/components/ui";
import { useBusiness } from "@/components/business-provider";
import { compressImage } from "@/lib/image";

function emptyDraft() {
  return {
    name: "",
    description: "",
    price: "",
    categoryId: "hamburguesas",
    emoji: "🍔",
    image: "",
    isAvailable: true,
    isActive: true,
  };
}

function ProductModal({ mode, product, categories, onClose, onSave }) {
  const [draft, setDraft] = useState(() =>
    product ? { ...product } : emptyDraft(),
  );
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");

  const updateDraft = (key, value) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const onImageChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImageError("");
    try {
      const image = await compressImage(file);
      updateDraft("image", image);
    } catch (imageLoadError) {
      setImageError(imageLoadError.message);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      setError("Escribe el nombre del plato.");
      return;
    }
    const numericPrice = Number(String(draft.price).replace(",", ".").trim());
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Indica un precio mayor que cero.");
      return;
    }
    await onSave({
      ...draft,
      name: draft.name.trim(),
      description: draft.description.trim(),
      price: numericPrice.toFixed(2),
      emoji: draft.emoji || "🍽️",
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl sm:max-h-[92dvh] sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
              {mode === "edit" ? "Editar producto" : "Nuevo producto"}
            </p>
            <h2 className="mt-1 font-display text-2xl tracking-[-0.03em] text-ink">
              {mode === "edit" ? "Actualiza el plato" : "Agrega un plato"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-soft text-muted hover:text-ink"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <Field
            label="Nombre del plato"
            value={draft.name}
            onChange={(value) => updateDraft("name", value)}
            placeholder="Ej. Hamburguesa Floresta"
          />
          <Field
            label="Descripción"
            value={draft.description}
            onChange={(value) => updateDraft("description", value)}
            placeholder="Ingredientes o preparación"
            multiline
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Precio (USD)"
              value={String(draft.price)}
              onChange={(value) => updateDraft("price", value)}
              placeholder="0.00"
              type="number"
            />
            <Select
              label="Categoría"
              value={draft.categoryId}
              onChange={(value) => updateDraft("categoryId", value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">Foto del plato</p>
            <p className="mt-0.5 text-[11px] leading-4 text-muted">
              Se optimiza antes de guardarse. Si no agregas foto, se usa el
              emoji del plato.
            </p>
            {draft.image ? (
              <div className="relative mt-2 h-40 overflow-hidden rounded-[20px] bg-amber-tint">
                <Image
                  src={draft.image}
                  alt="Vista previa del plato"
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, 448px"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => updateDraft("image", "")}
                  aria-label="Quitar foto del plato"
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink shadow-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="mt-2 flex h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[20px] border border-dashed border-line bg-soft text-sm font-semibold text-muted transition hover:border-accent/50 hover:text-accent">
                <span className="text-xl">📷</span>
                Elegir foto
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={onImageChange}
                  className="sr-only"
                />
              </label>
            )}
            {imageError ? (
              <p className="mt-2 text-xs font-semibold text-accent">{imageError}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl bg-soft px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Disponible hoy</p>
              <p className="text-[11px] text-muted">
                Indica si se puede pedir ahora.
              </p>
            </div>
            <Toggle
              checked={draft.isAvailable}
              onChange={(value) => updateDraft("isAvailable", value)}
              label="Disponible hoy"
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl bg-soft px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Mostrar en el menú</p>
              <p className="text-[11px] text-muted">
                Los platos ocultos no se incluyen en el cálculo.
              </p>
            </div>
            <Toggle
              checked={draft.isActive}
              onChange={(value) => updateDraft("isActive", value)}
              label="Mostrar en el menú"
            />
          </div>

          <div className="flex items-start gap-2 rounded-2xl bg-amber-tint p-3 text-xs leading-5 text-[#6a4700]">
            <span className="text-base">☆</span>
            Las puntuaciones se generan con calificaciones de clientes. El
            negocio no puede agregarlas ni modificarlas.
          </div>

          {error ? (
            <p className="text-sm font-semibold text-accent">{error}</p>
          ) : null}
        </div>

        <div className="sticky -bottom-5 z-10 -mx-5 mt-5 flex gap-2 border-t border-line bg-white px-5 py-3 sm:-bottom-6 sm:-mx-6 sm:px-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1">
            {mode === "edit" ? "Guardar cambios" : "Agregar al menú"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function MenuClient() {
  const { business, products, categories, updateProduct, addProduct } =
    useBusiness();
  const [categoryId, setCategoryId] = useState("todos");
  const [modal, setModal] = useState(null);

  if (!business) {
    return (
      <div className="rounded-[24px] bg-soft p-8 text-center text-sm text-muted">
        Cargando menú…
      </div>
    );
  }

  const visibleProducts = products
    .filter(
      (product) => categoryId === "todos" || product.categoryId === categoryId,
    )
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  const activeCount = products.filter((product) => product.isActive).length;
  const availableCount = products.filter(
    (product) => product.isActive && product.isAvailable,
  ).length;

  const saveProduct = async (draft) => {
    if (modal?.mode === "edit") {
      await updateProduct(modal.product.id, draft);
    } else {
      await addProduct(draft);
    }
    setModal(null);
  };

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        Administración
      </p>
      <h1 className="mt-2 font-display text-[38px] leading-none tracking-[-0.045em] text-ink">
        Tu menú
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Mantén tus platos, precios y disponibilidad al día para tus clientes.
      </p>

      <section className="mt-5 flex flex-wrap items-center gap-4 rounded-[24px] bg-white p-4 shadow-sm">
        <div>
          <p className="font-display text-2xl text-ink">{activeCount}</p>
          <p className="text-[11px] text-muted">platos activos</p>
        </div>
        <div className="h-9 w-px bg-line" />
        <div>
          <p className="font-display text-2xl text-ink">{availableCount}</p>
          <p className="text-[11px] text-muted">disponibles hoy</p>
        </div>
        <Button
          type="button"
          onClick={() => setModal({ mode: "new", product: null })}
          className="ml-auto"
        >
          <Plus className="h-4 w-4" />
          Plato
        </Button>
      </section>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setCategoryId("todos")}
          className={`inline-flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition ${
            categoryId === "todos"
              ? "bg-ink text-white"
              : "bg-beige text-ink hover:bg-[#ebe0d4]"
          }`}
        >
          Todo el menú
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setCategoryId(category.id)}
            className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition ${
              categoryId === category.id
                ? "bg-ink text-white"
                : "bg-beige text-ink hover:bg-[#ebe0d4]"
            }`}
          >
            <span>{category.emoji}</span>
            {category.label}
          </button>
        ))}
      </div>

      <SectionTitle
        title="Productos"
        description={`${visibleProducts.length} en esta vista`}
      />

      {visibleProducts.length ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              category={categories.find(
                (category) => category.id === product.categoryId,
              )}
              onEdit={() => setModal({ mode: "edit", product })}
              onToggle={(id, value) =>
                updateProduct(id, { isAvailable: value })
              }
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] bg-soft p-6 text-center">
          <p className="text-sm font-semibold text-ink">
            No hay platos en esta categoría
          </p>
          <p className="mt-1 text-xs text-muted">
            Puedes agregar el primero con el botón “Plato”.
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2 rounded-[24px] bg-amber-tint p-4">
        <Pill tone="amber">Solo lectura</Pill>
        <p className="text-xs leading-5 text-[#6a4700]">
          Las puntuaciones no se editan desde el negocio. Los platos nuevos
          aparecen sin puntuación hasta que existan datos de clientes.
        </p>
      </div>

      {modal ? (
        <ProductModal
          key={modal.product?.id || "new"}
          mode={modal.mode}
          product={modal.product}
          categories={categories}
          onClose={() => setModal(null)}
          onSave={saveProduct}
        />
      ) : null}
    </div>
  );
}
