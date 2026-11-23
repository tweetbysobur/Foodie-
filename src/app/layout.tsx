import type { Metadata, Viewport } from "next";
import { DM_Sans, Nunito, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

/** Primary: headings, names, prices, buttons, labels. */
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
/** Secondary: descriptions and supporting text. */
const dm = DM_Sans({ variable: "--font-dm", subsets: ["latin"], weight: ["400", "500"] });
/** Wordmark only: rounded, bold, friendly. */
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], weight: ["900"] });

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
    <html lang="en-NG" className={`${jakarta.variable} ${dm.variable} ${nunito.variable}`}>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
