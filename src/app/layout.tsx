import type { Metadata } from "next";
import { Pixelify_Sans } from "next/font/google";
import "./globals.css";
import ConditionalAnnouncementBar from "@/components/ConditionalAnnouncementBar";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import VercelAnalytics from "@/components/VercelAnalytics";
import FirebaseAnalytics from "@/components/FirebaseAnalytics";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();
const defaultDescription =
  "SANDBOX (Sandbox BD, Sanbox) is a startup feedback platform for Bangladesh and global founders: honest reviews, a public startup gallery, and URL-based insights, with no sugar-coating.";

const pixelifySans = Pixelify_Sans({
  variable: "--font-pixelify-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** Bump this when you replace `public/sandbox-bd-startup-feedback-icon.png` (favicons cache very hard). */
const FAVICON_HREF = "/sandbox-bd-startup-feedback-icon.png?v=3";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "SANDBOX - Startup Bangladesh reviews, feedback & gallery | Sandbox BD",
    template: "%s | SANDBOX",
  },
  description: defaultDescription,
  keywords: [
    "startup bangladesh",
    "startup",
    "sanbox",
    "sandbox bd",
    "sandboxbd",
    "startup feedback",
    "startup review",
    "startup feedback platform",
    "honest startup reviews",
    "startup validation",
    "startup gallery",
    "bangladesh startup",
    "dhaka startup",
    "entrepreneur feedback",
    "startup critique",
    "business feedback",
    "startup evaluation",
  ],
  authors: [{ name: "FluvoSoft" }],
  creator: "FluvoSoft",
  publisher: "FluvoSoft",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "SANDBOX",
    title: "SANDBOX - Startup feedback & reviews (Bangladesh & global)",
    description: defaultDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SANDBOX - startup feedback and reviews (Sandbox BD)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SANDBOX - Startup feedback & reviews | Sandbox BD",
    description: defaultDescription,
    images: ["/og-image.png"],
    creator: "@sandboxbd",
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },
  category: "Technology",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SANDBOX",
  },
  other: {
    "theme-color": "#37352f",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "SANDBOX",
        alternateName: ["Sandbox BD", "Sanbox", "sandboxbd", "SANDBOX BD"],
        description: defaultDescription,
        inLanguage: "en",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "FluvoSoft",
        url: "https://www.fluvoSoft.com",
        brand: { "@type": "Brand", name: "SANDBOX" },
      },
      {
        "@type": "WebApplication",
        "@id": `${siteUrl}/#webapp`,
        name: "SANDBOX",
        alternateName: ["Sandbox BD", "Sanbox"],
        url: siteUrl,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        description: defaultDescription,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        browserRequirements: "Requires JavaScript",
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href={FAVICON_HREF} type="image/png" />
        <link rel="apple-touch-icon" href={FAVICON_HREF} />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${pixelifySans.variable} min-h-screen bg-[#f7f6f3] text-[#37352f]`}
      >
        <ConditionalAnnouncementBar />
        <ConditionalNavbar />
        {children}
        <VercelAnalytics />
        <FirebaseAnalytics />
      </body>
    </html>
  );
}
