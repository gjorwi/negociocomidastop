import QrClient from "./qr-client";

export const instant = false;

export const metadata = {
  title: "Código QR · comidasTop",
  description: "Genera y descarga el código QR de tu negocio.",
};

export default function QrPage() {
  return <QrClient />;
}
