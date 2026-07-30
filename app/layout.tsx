import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    title: "ΜΕΤΡΟΝ — Ιστορικός μετατροπέας μονάδων",
    description:
      "Μετατροπές αρχαίων ελληνικών, ρωμαϊκών και σύγχρονων μονάδων μήκους, επιφάνειας, μάζας και χωρητικότητας.",
    applicationName: "ΜΕΤΡΟΝ",
    authors: [{ name: "Historical Units" }],
    icons: { icon: "/favicon.svg" },
    openGraph: {
      type: "website",
      locale: "el_GR",
      url: origin,
      siteName: "ΜΕΤΡΟΝ",
      title: "Από τον δάκτυλο στο χιλιόμετρο.",
      description: "Ιστορικός & σύγχρονος μετατροπέας μονάδων",
      images: [
        {
          url: `${origin}/og.png`,
          width: 1200,
          height: 630,
          alt: "ΜΕΤΡΟΝ — ιστορικός και σύγχρονος μετατροπέας μονάδων",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "ΜΕΤΡΟΝ",
      description: "Από τον δάκτυλο στο χιλιόμετρο.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el">
      <body>{children}</body>
    </html>
  );
}
