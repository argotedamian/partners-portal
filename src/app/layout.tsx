import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Partners Portal",
  description: "Portal de cotización de garantías Hoggax para partners",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Preload Rive for animations */}
        <link rel="preload" href="/animations/rive/09_personas_cocinando.riv" as="fetch" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-white text-gray-900 font-sans" suppressHydrationWarning>
        <Navbar />
        {children}
      </body>
    </html>
  );
}