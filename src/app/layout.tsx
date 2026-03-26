import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { LoadingProvider } from "@/components/loading-screen";
import { Navbar } from "@/components/navbar";
import { SiteChrome } from "@/components/site-chrome";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClarityProvider } from "@/components/clarity-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: {
    default: "Khaled Ashraf — Design, Code, and Everything Between",
    template: "%s — Khaled Ashraf",
  },
  description:
    "Product Designer with a background in Computer Engineering. Building at the intersection of design tools and code.",
  openGraph: {
    title: "Khaled Ashraf — Design, Code, and Everything Between",
    description:
      "Product Designer with a background in Computer Engineering. Building at the intersection of design tools and code.",
    url: "https://khaledashraf.me",
    siteName: "Khaled Ashraf",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://khaledashraf.me/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Khaled Ashraf",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Khaled Ashraf — Design, Code, and Everything Between",
    description:
      "Product Designer with a background in Computer Engineering. Building at the intersection of design tools and code.",
    images: ["https://khaledashraf.me/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Khaled Ashraf",
  "url": "https://khaledashraf.me",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <LoadingProvider>
            <Navbar />
            <SiteChrome>{children}</SiteChrome>
          </LoadingProvider>
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
        <Analytics />
        <SpeedInsights />
        <ClarityProvider />
      </body>
    </html>
  );
}
