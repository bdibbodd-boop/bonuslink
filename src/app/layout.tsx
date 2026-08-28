import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://bonuslink.example"),
  title: { default: "BonusLink | Gagnez avec vos recommandations", template: "%s | BonusLink" },
  description: "Une plateforme transparente pour recommander, suivre vos récompenses et demander un retrait.",
  alternates: { canonical: "/" },
  openGraph: { title: "BonusLink | Gagnez avec vos recommandations", description: "Recommandez des proches et suivez vos récompenses en toute transparence.", url: "https://bonuslink.example", siteName: "BonusLink", locale: "fr_FR", type: "website" },
  twitter: { card: "summary_large_image", title: "BonusLink", description: "Recommandez. Suivez. Récompensez." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
