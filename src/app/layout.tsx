import type { Metadata, Viewport } from "next";
import { Tracker } from "@/components/Tracker";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.FORMULAK_SITE_URL ?? "https://formulak.news"),
  title: "FORMULAK · هەواڵی فۆڕمولا ١ بە کوردی",
  description: "هەواڵی فۆڕمولا ١ و جیهانی پێشبڕکێی فۆڕمولا بە کوردیی سۆرانی، هەموو ڕۆژێک، لەگەڵ سەرچاوەکانی.",
  openGraph: { siteName: "FORMULAK", locale: "ckb_IQ", type: "website" },
};

export const viewport: Viewport = { themeColor: "#0A0A0A", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ckb" dir="rtl">
      <body>
        <a href="#main" className="skip">
          بڕۆ بۆ ناوەڕۆک
        </a>
        {children}
        <Tracker />
      </body>
    </html>
  );
}
