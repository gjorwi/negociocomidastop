import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import { formatScore, getAdjustedProductScore } from "@/lib/scoring";

const pillTones = {
  beige: "bg-beige text-ink",
  accent: "bg-accent text-white",
  open: "bg-green-tint text-open",
  amber: "bg-amber-tint text-[#6a4700]",
  dark: "bg-ink text-white",
  red: "bg-accent-tint text-accent",
};

export function Pill({ children, tone = "beige", className = "" }) {
  return (
    <span
      className={`inline-flex min-h-6 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${pillTones[tone] || pillTones.beige} ${className}`}
    >
      {children}
    </span>
  );
}

export function SectionTitle({ title, description, action, href }) {
  return (
    <div className="mb-3 mt-8 flex items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-[24px] leading-tight tracking-[-0.03em] text-ink">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-5 text-muted">{description}</p>
        ) : null}
      </div>
      {action && href ? (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-accent hover:underline"
        >
          {action}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

export function RatingLine({ score, count, compact = false }) {
  return (
    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink">
      <Star className="h-4 w-4 fill-mustard text-mustard" />
      {formatScore(score)}
      {typeof count === "number" ? (
        <span className="font-normal text-muted">
          · {count}
          {compact ? "" : " puntuaciones"}
        </span>
      ) : null}
    </span>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const variants = {
    primary: "bg-accent text-white hover:bg-[#b33a0d]",
    secondary: "bg-beige text-ink hover:bg-[#ebe0d4]",
    outline: "border border-line bg-white text-ink hover:bg-soft",
  };

  return (
    <button
      {...props}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full p-1 transition ${
        checked ? "bg-open" : "bg-line"
      }`}
    >
      <span
        className={`block h-6 w-6 rounded-full bg-white shadow-sm transition ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  multiline = false,
  helper,
}) {
  const inputClass =
    "mt-1.5 w-full rounded-2xl border border-line bg-soft px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-accent/60 focus:bg-white";

  return (
    <label className="block text-sm font-semibold text-ink">
      {label}
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={4}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={type}
          className={inputClass}
        />
      )}
      {helper ? (
        <span className="mt-1 block text-[11px] font-normal leading-4 text-muted">
          {helper}
        </span>
      ) : null}
    </label>
  );
}

export function Select({ label, value, onChange, children }) {
  return (
    <label className="block text-sm font-semibold text-ink">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-2xl border border-line bg-soft px-4 py-3 text-sm text-ink outline-none focus:border-accent/60 focus:bg-white"
      >
        {children}
      </select>
    </label>
  );
}

export function ProductCard({ product, category, onEdit, onToggle }) {
  return (
    <article className="flex h-[248px] flex-col rounded-[24px] border border-line/70 bg-white/65 p-3 shadow-sm backdrop-blur-[2px]">
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-tint text-[28px]">
          {product.emoji || "🍽️"}
        </span>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-accent transition hover:bg-accent hover:text-white"
        >
          Editar
        </button>
      </div>
      <h3 className="mt-2 line-clamp-2 text-[14px] font-semibold leading-5 text-ink">
        {product.name}
      </h3>
      <p className="mt-1 text-[11px] text-muted">
        {category?.label} · ${Number(product.price).toFixed(2)}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        {product.ratingsCount > 0 ? (
          <RatingLine
            score={getAdjustedProductScore(product)}
            count={product.ratingsCount}
            compact
          />
        ) : (
          <span className="text-[11px] text-muted">Sin puntuación</span>
        )}
        {product.ratingsCount > 0 && product.ratingsCount < 5 ? (
          <Pill tone="amber">Muestra pequeña</Pill>
        ) : null}
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-2.5">
        <span className="text-[11px] font-semibold text-ink">
          {product.isAvailable ? "Disponible hoy" : "Agotado por hoy"}
        </span>
        <Toggle
          checked={product.isAvailable}
          onChange={(value) => onToggle(product.id, value)}
          label={`Disponibilidad de ${product.name}`}
        />
      </div>
    </article>
  );
}
