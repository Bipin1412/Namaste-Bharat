import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Noto_Sans, Noto_Sans_Devanagari } from "next/font/google";
import BottomNav from "../components/BottomNav";
import MarketplaceHeader from "../components/MarketplaceHeader";
import SiteFooter from "../components/SiteFooter";
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-sans-latin",
  display: "swap",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-sans-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Namaste Bharat",
  description: "Modern MSME discovery platform for Bharat.",
  applicationName: "Namaste Bharat",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Namaste Bharat",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${notoSans.variable} ${notoSansDevanagari.variable}`}
    >
      <body className="min-h-dvh bg-slate-50 text-slate-900 antialiased [font-family:var(--font-sans-latin),var(--font-sans-devanagari),sans-serif]">
        <MarketplaceHeader />
        <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col">
          <main className="flex-1 pb-20 md:pb-8">{children}</main>
        </div>
        <SiteFooter />
        <BottomNav />
      </body>
    </html>
  );
}
