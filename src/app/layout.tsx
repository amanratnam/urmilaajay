import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { LayoutProvider } from "@/components/layout/LayoutProvider";

// Edge-to-edge on notched phones; the browser UI tints to the paper tone.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FAF9F6",
};

export const metadata: Metadata = {
  title: { default: "Urmila & Ajay", template: "%s — Urmila & Ajay" },
  description: "A memorial archive for Urmila (1980–2018) and Ajay (1971–2021), remembered with love by Aman and Aashi.",
  metadataBase: new URL("https://urmilaajay.com"),
  openGraph: {
    title: "Urmila & Ajay",
    description: "A memorial archive for Urmila (1980–2018) and Ajay (1971–2021), remembered with love by Aman and Aashi.",
    url: "https://urmilaajay.com",
    siteName: "Urmila & Ajay",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og?title=Urmila%20%26%20Ajay&sub=Remembered%20with%20love%2C%20always.",
        width: 1200,
        height: 630,
        alt: "Urmila & Ajay",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Urmila & Ajay",
    description: "A memorial archive remembered with love by Aman and Aashi.",
    images: ["/og?title=Urmila%20%26%20Ajay&sub=Remembered%20with%20love%2C%20always."],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://urmilaajay.com" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="grain-overlay" aria-hidden="true" />
        <div className="vignette-overlay" aria-hidden="true" />
        <CustomCursor />
        <LayoutProvider>{children}</LayoutProvider>
      </body>
    </html>
  );
}
