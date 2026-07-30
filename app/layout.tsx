import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

function createMetadata(origin: string, basePath = ""): Metadata {
  const normalizedOrigin = origin.replace(/\/$/, "");
  const normalizedBasePath = basePath.replace(/\/$/, "");
  const siteUrl = `${normalizedOrigin}${normalizedBasePath}/`;
  const assetUrl = (path: string) =>
    `${normalizedOrigin}${normalizedBasePath}${path}`;

  return {
    metadataBase: new URL(siteUrl),
    title: "ΜΕΤΡΟΝ — Ιστορικός μετατροπέας μονάδων",
    description:
      "Μετατροπές αρχαίων ελληνικών, ρωμαϊκών και σύγχρονων μονάδων μήκους, επιφάνειας, μάζας και χωρητικότητας.",
    applicationName: "ΜΕΤΡΟΝ",
    authors: [{ name: "Historical Units" }],
    icons: { icon: assetUrl("/favicon.svg") },
    openGraph: {
      type: "website",
      locale: "el_GR",
      url: siteUrl,
      siteName: "ΜΕΤΡΟΝ",
      title: "Από τον δάκτυλο στο χιλιόμετρο.",
      description: "Ιστορικός & σύγχρονος μετατροπέας μονάδων",
      images: [
        {
          url: assetUrl("/og.png"),
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
      images: [assetUrl("/og.png")],
    },
  };
}

export async function generateMetadata(): Promise<Metadata> {
  if (process.env.METRON_GITHUB_PAGES === "true") {
    return createMetadata(
      process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://itzortzak.github.io",
      process.env.NEXT_PUBLIC_BASE_PATH ?? "/metron-historical-units",
    );
  }

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return createMetadata(origin);
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
