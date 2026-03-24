import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://taxedfor.com";
const siteName = "TaxedFor";
const siteDescription = "See exactly where your federal tax dollars go. Upload your W-2 or enter your tax withholdings to get a detailed breakdown of how your money funds defense, healthcare, social security, and 50+ government programs.";
const siteKeywords = "tax calculator, where do my taxes go, federal tax breakdown, W2 tax analyzer, tax spending, government spending, federal budget, tax dollars, income tax breakdown, tax visualization, W-2 upload, tax withholding calculator";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TaxedFor — See Exactly Where Your Tax Dollars Go",
    template: "%s | TaxedFor",
  },
  description: siteDescription,
  keywords: siteKeywords,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  applicationName: siteName,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteName,
    title: "TaxedFor — See Exactly Where Your Tax Dollars Go",
    description: siteDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TaxedFor - Federal Tax Breakdown Calculator",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "TaxedFor — See Exactly Where Your Tax Dollars Go",
    description: siteDescription,
    images: ["/og-image.png"],
    creator: "@taxedfor",
  },

  // Robots
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

  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },

  // Manifest
  manifest: "/site.webmanifest",

  // Verification (add your actual verification codes)
  // verification: {
  //   google: "your-google-verification-code",
  //   yandex: "your-yandex-verification-code",
  // },

  // Alternate languages (if applicable)
  alternates: {
    canonical: siteUrl,
  },

  // Category
  category: "finance",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "TaxedFor",
  url: "https://taxedfor.com",
  description: "See exactly where your federal tax dollars go. Upload your W-2 or enter your tax withholdings to get a detailed breakdown of government spending.",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  creator: {
    "@type": "Organization",
    name: "TaxedFor",
    url: "https://taxedfor.com",
  },
  featureList: [
    "W-2 Upload Analysis",
    "Manual Tax Entry",
    "Federal Budget Breakdown",
    "State Tax Information",
    "50+ Budget Categories",
    "Shareable Results",
  ],
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TaxedFor",
  url: "https://taxedfor.com",
  logo: "https://taxedfor.com/logo.png",
  sameAs: [
    "https://twitter.com/taxedfor",
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Where do my federal tax dollars go?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your federal taxes fund various government programs including Social Security (23%), Medicare & Health (25%), National Defense (13%), Interest on Debt (11%), and many other programs. TaxedFor shows you exactly how your specific withholdings are allocated.",
      },
    },
    {
      "@type": "Question",
      name: "Is my W-2 data stored?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Your W-2 is processed using AWS Textract (OCR technology) — not AI or any LLM. Your document is never stored and is processed in-memory only. For maximum privacy, you can use manual entry instead of uploading.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate is the tax breakdown?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Budget allocations are approximations based on publicly available federal spending data from the Congressional Budget Office and Treasury Department. Individual allocations may vary.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body
        style={{
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#000000",
          color: "#ffffff",
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        }}
      >
        {children}
      </body>
    </html>
  );
}
