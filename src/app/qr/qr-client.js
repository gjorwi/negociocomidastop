"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, Printer, QrCode, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";
import { useBusiness } from "@/components/business-provider";

const CLIENT_URL =
  process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000";

export default function QrClient() {
  const { business, ready } = useBusiness();
  const [version, setVersion] = useState(0);
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!business?.id) return;
    let active = true;
    const baseUrl = `${CLIENT_URL.replace(/\/+$/, "")}/escanear/${business.id}`;
    const url = version ? `${baseUrl}?v=${version}` : baseUrl;

    import("qrcode")
      .then((module) => {
        const QRCode = module.default ?? module;
        return QRCode.toDataURL(url, {
          width: 640,
          margin: 2,
          errorCorrectionLevel: "M",
          color: { dark: "#231C18", light: "#FFFFFF" },
        });
      })
      .then((dataUrl) => {
        if (active) {
          setQr(dataUrl);
          setError("");
        }
      })
      .catch(() => {
        if (active) setError("No se pudo generar el código QR.");
      });

    return () => {
      active = false;
    };
  }, [business?.id, version]);

  if (!ready) {
    return (
      <div className="rounded-[24px] bg-soft p-8 text-center text-sm text-muted">
        Cargando panel…
      </div>
    );
  }

  if (!business) {
    return (
      <div className="rounded-[24px] bg-soft p-8 text-center text-sm text-muted">
        No hay un negocio asociado a esta cuenta.
      </div>
    );
  }

  const download = () => {
    if (!qr) return;
    const link = document.createElement("a");
    link.href = qr;
    link.download = `comidastop-${business.id}.png`;
    link.click();
  };

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        Acceso de clientes
      </p>
      <h1 className="mt-2 font-display text-[38px] leading-none tracking-[-0.045em] text-ink">
        Tu código QR
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Coloca este código en las mesas o en la entrada de {business.name}. Tus
        clientes lo escanean desde comidasTop para puntuar tus platos.
      </p>

      <section className="mt-6 rounded-[28px] bg-white p-5 shadow-sm sm:p-7">
        <div className="mx-auto flex max-w-sm flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-tint">
            <QrCode className="h-6 w-6 text-accent" aria-hidden="true" />
          </span>
          <h2 className="mt-3 font-display text-2xl tracking-[-0.03em] text-ink">
            Escanea para puntuar
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            El QR abre la pantalla de puntuación de {business.name}. El cliente
            debe permitir la ubicación para confirmar que está en el local.
          </p>

          <div className="mt-5 flex min-h-[264px] w-full items-center justify-center rounded-[22px] border border-line bg-soft p-4">
            {qr ? (
              <Image
                src={qr}
                alt={`Código QR de ${business.name}`}
                width={320}
                height={320}
                unoptimized
                className="h-auto w-full max-w-[320px]"
              />
            ) : (
              <span className="text-sm text-muted">Generando QR…</span>
            )}
          </div>

          {error ? (
            <p className="mt-3 text-xs font-semibold text-accent">{error}</p>
          ) : null}

          <div className="mt-5 flex w-full flex-wrap justify-center gap-2">
            <Button type="button" onClick={download} disabled={!qr}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Descargar
            </Button>
            <Button type="button" variant="secondary" onClick={() => window.print()} disabled={!qr}>
              <Printer className="h-4 w-4" aria-hidden="true" />
              Imprimir
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-2 w-full"
            onClick={() => setVersion(Date.now())}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Generar un QR nuevo
          </Button>
        </div>
      </section>

      <div className="mt-4 rounded-[24px] bg-amber-tint p-4 text-xs leading-5 text-[#6a4700]">
        Cada vez que generes un QR nuevo, la imagen cambia. Si ya imprimiste el
        anterior, reemplázalo por el nuevo.
      </div>
    </div>
  );
}
