import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

/** Outfit: the one typeface, from headline to tab labels. */
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Foodie",
  description: "Order Nigerian food from kitchens near you.",
  icons: { icon: "/favicon.ico", apple: "/brand/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#FFF4E8",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-NG" className={outfit.variable}>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
