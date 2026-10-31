import type { Metadata, Viewport } from "next";
import "@fontsource-variable/jost";
import "@fontsource/cairo/300.css";
import "@fontsource/cairo/400.css";
import "@fontsource/cairo/600.css";
import "@fontsource/cairo/arabic-300.css";
import "@fontsource/cairo/arabic-400.css";
import "@fontsource/cairo/arabic-600.css";
import "./globals.css";
import Providers from "./providers";
import { themeScript } from "@/lib/theme";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Evonlia — Elevate. Innovate. Inspire.",
  description: "Websites and apps built around your business. Tell us the problem and book a free 30-minute meeting.",
  openGraph: {
    title: "Evonlia",
    description: "Tell us the problem. We build the solution. Book a free meeting.",
    images: ["/brand/og.png"],
  },
};
export const viewport: Viewport = { themeColor: "#08090B" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
