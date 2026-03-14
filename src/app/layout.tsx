import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import ConditionalAnnouncementBar from "@/components/ConditionalAnnouncementBar";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import VercelAnalytics from "@/components/VercelAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sandboxbd.com"), // Update with your actual domain
  title: {
    default: "SANDBOX - Get Honest Startup Feedback & Reviews",
    template: "%s | SANDBOX",
  },
  description:
    "Get brutally honest feedback about your startup. Paste your website URL and receive real insights from experienced entrepreneurs. Browse our gallery of reviewed startups and discover what people really think.",
  keywords: [
    "startup feedback",
    "startup review",
    "startup feedback platform",
    "honest startup reviews",
    "startup validation",
    "startup gallery",
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
    url: "https://sandboxbd.com", // Update with your actual domain
    siteName: "SANDBOX",
    title: "SANDBOX - Get Honest Startup Feedback & Reviews",
    description:
      "Get brutally honest feedback about your startup. Paste your website URL and receive real insights from experienced entrepreneurs.",
    images: [
      {
        url: "/og-image.png", // You'll need to create this image
        width: 1200,
        height: 630,
        alt: "SANDBOX - Startup Feedback Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SANDBOX - Get Honest Startup Feedback & Reviews",
    description:
      "Get brutally honest feedback about your startup. Paste your website URL and receive real insights.",
    images: ["/og-image.png"], // You'll need to create this image
    creator: "@sandboxbd", // Update with your Twitter handle
  },
  alternates: {
    canonical: "https://sandboxbd.com", // Update with your actual domain
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
    "@type": "WebSite",
    name: "SANDBOX",
    description:
      "Get brutally honest feedback about your startup. Paste your website URL and receive real insights from experienced entrepreneurs.",
    url: "https://sandboxbd.com", // Update with your actual domain
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://sandboxbd.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "FluvoSoft",
      url: "https://www.fluvoSoft.com",
    },
  };

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} min-h-screen bg-[#f7f6f3] text-[#37352f] antialiased`}
      >
        <ConditionalAnnouncementBar />
        <ConditionalNavbar />
        {children}
        <VercelAnalytics />
      </body>
    </html>
  );
}
