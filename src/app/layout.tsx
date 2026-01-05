import type { Metadata } from "next";
import Script from "next/script";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Il Fornaccio - Authentic Neapolitan Pizza",
  description: "Wood-fired pizza in the heart of the city",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`dark ${montserrat.variable} ${cormorant.variable}`}>
      <body className="font-sans min-h-screen flex flex-col bg-background text-foreground">
        <main className="flex-1">
          {children}
        </main>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry,marker&loading=async`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
