import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import "./globals.css";
import GeneralProviders from "@/shared/providers/GeneralProviders";

const barlow = Barlow({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

// const barlowCondensed = Barlow_Condensed({
//   variable: "--font-barlow-condensed",
//   subsets: ["latin"],
// });

// const barlowSemiCondensed = Barlow_Semi_Condensed({
//   variable: "--font-barlow-semi-condensed",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Dashboard Makan Bergizi Gratis - Program Prabowo",
  description: "Website untuk memantau pengiriman makan bergizi gratis yang merupakan program dari Presiden Prabowo. Platform digital untuk mengelola distribusi makanan sehat ke sekolah-sekolah di seluruh Indonesia.",
  keywords: [
    "makan bergizi gratis",
    "program prabowo",
    "makanan sehat sekolah",
    "dashboard monitoring",
    "distribusi makanan",
    "gizi anak indonesia",
    "program pemerintah",
    "nutrisi sekolah"
  ],
  authors: [{ name: "Tim Pengembang Makan Bergizi Gratis" }],
  creator: "Kementerian Pendidikan dan Kebudayaan",
  publisher: "Pemerintah Republik Indonesia",
  category: "Pendidikan dan Kesehatan",
  openGraph: {
    title: "Dashboard Makan Bergizi Gratis - Program Prabowo",
    description: "Platform monitoring pengiriman makan bergizi gratis untuk sekolah-sekolah di Indonesia",
    type: "website",
    locale: "id_ID",
    siteName: "Dashboard Makan Bergizi Gratis"
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard Makan Bergizi Gratis",
    description: "Memantau distribusi makan bergizi gratis program Presiden Prabowo"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${barlow.className} antialiased`}>
        <GeneralProviders>{children}</GeneralProviders>
      </body>
    </html>
  );
}
