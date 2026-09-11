import type { Metadata, Viewport } from "next";
import { Anek_Latin } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

const anekLatin = Anek_Latin({
  subsets: ["latin"],
  weight: "variable",
  axes: ["wdth"],
  variable: "--font-anek-latin",
  display: "swap",
});

/*
  The share image and apple-touch icon come from the file conventions in this
  folder (opengraph-image.png + .alt.txt, apple-icon.png), which Next turns
  into tags with dimensions and a content-hashed URL. The Twitter card reuses
  the Open Graph image, so there is no separate twitter-image file.
*/
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.title,
  description: SITE.description,
  applicationName: SITE.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    url: "/",
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1026",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={anekLatin.variable} suppressHydrationWarning>
      <head>
        {/*
          Mirrors the original site's inline script: flags JS as available
          before first paint so CSS-driven entrance animations (which are
          scoped under html.js) never flash unanimated content first.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
