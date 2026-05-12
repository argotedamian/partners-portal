import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AppStateProvider } from "@/state/AppStateContext";
import { AuthGate } from "@/components/auth-gate";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://partners.hoggax.com"),
  title: {
    default: "Hoggax Partners",
    template: "%s | Hoggax Partners",
  },
  description: "Portal de gestión de garantías Hoggax para partners.",
  applicationName: "Hoggax Partners",
  keywords: ["Hoggax", "Partners", "garantía", "garantía de alquiler", "gestión"],
  category: "finance",
  creator: "Hoggax",
  publisher: "Hoggax",
  alternates: {
    canonical: "/",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    apple: [{ url: "/favicon.ico", sizes: "any" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    url: "https://partners.hoggax.com/",
    siteName: "Hoggax Partners",
    title: "Hoggax Partners",
    description: "Portal de gestión de garantías Hoggax para partners.",
    locale: "es_AR",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Hoggax Partners",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hoggax Partners",
    description: "Portal de gestión de garantías Hoggax para partners.",
    images: ["/twitter-image"],
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white font-sans antialiased" suppressHydrationWarning>
        <AppStateProvider>
          <AuthGate>
            <Navbar />
            {children}
          </AuthGate>
        </AppStateProvider>
      </body>
    </html>
  );
}