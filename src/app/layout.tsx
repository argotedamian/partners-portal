import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  metadataBase: new URL("https://partners.hoggax.com"),
  title: {
    default: "Hoggax Partners",
    template: "%s | Hoggax Partners",
  },
  description: "Portal de cotización de garantías Hoggax para partners.",
  applicationName: "Hoggax Partners",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://partners.hoggax.com/",
    siteName: "Hoggax Partners",
    title: "Hoggax Partners",
    description: "Portal de cotización de garantías Hoggax para partners.",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hoggax Partners",
    description: "Portal de cotización de garantías Hoggax para partners.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/hoggax-logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/hoggax-logo.svg" />
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