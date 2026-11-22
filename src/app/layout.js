import localFont from "next/font/local";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { AuthProvider } from "@/components/auth-provider";
import { BusinessProvider } from "@/components/business-provider";

const figtree = localFont({
  src: [
    { path: "./fonts/Figtree_400Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Figtree_600SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/Figtree_700Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-figtree",
  display: "swap",
});

const bricolage = localFont({
  src: [
    {
      path: "./fonts/BricolageGrotesque_800ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata = {
  title: "comidasTop · Negocios",
  description: "Panel de administración para establecimientos de comida en comidasTop.",
};

export const viewport = {
  themeColor: "#c9410f",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${figtree.variable} ${bricolage.variable}`}>
      <body>
        <AuthProvider>
          <BusinessProvider>
            <AppShell>{children}</AppShell>
          </BusinessProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
