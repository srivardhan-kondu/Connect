import type { Metadata, Viewport } from "next";
import { Anek_Latin } from "next/font/google";
import "./globals.css";

const anekLatin = Anek_Latin({
  subsets: ["latin"],
  weight: "variable",
  axes: ["wdth"],
  variable: "--font-anek-latin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CONNECT | Bringing our Communities Closer.",
  description:
    "A trusted digital ecosystem designed to bring our communities closer, foster meaningful connections, and unlock new opportunities for collective growth. Join the waitlist.",
  openGraph: {
    title: "CONNECT | Bringing our Communities Closer.",
    description:
      "Something meaningful is being built for communities. Join the waitlist.",
    type: "website",
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
