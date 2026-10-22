// Polyfill process.umask for edge/Cloudflare Workers runtime
if (typeof process !== "undefined") {
  try {
    process.umask = () => 0;
  } catch {}
}

import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "@/components/ThemeProvider"
import { Toaster } from "sonner"
import { AnalyticsTracker } from "@/components/AnalyticsTracker"

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" })
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  metadataBase: new URL("https://www.rankowise.online"),
  title: {
    default: "RankoWise | Multi-Criteria Decision Intelligence & MCDM Calculator",
    template: "%s | RankoWise",
  },
  description:
    "RankoWise is an advanced Multi-Criteria Decision Making (MCDM) and Decision support systems platform for academic research, engineering, and business intelligence. Calculate SWEI Method, SWI Method, AHP, TOPSIS, VIKOR, PROMETHEE, Fuzzy logic, Monte Carlo simulations, and sensitivity analysis.",
  applicationName: "RankoWise",
  authors: [{ name: "RankoWise Academic & Decision Intelligence Team", url: "https://www.rankowise.online" }],
  creator: "RankoWise",
  publisher: "RankoWise",
  keywords: [
    "RankoWise",
    "rankowise.online",
    "MCDM Calculator",
    "Multi-Criteria Decision Making",
    "SWEI MCDM Method",
    "SWI MCDM Method",
    "Decision support systems",
    "AHP Calculator",
    "TOPSIS Method",
    "VIKOR Ranking",
    "PROMETHEE",
    "SWEI Method",
    "SWI Method",
    "Fuzzy MCDM",
    "Sensitivity Analysis",
    "Monte Carlo Simulation",
    "Academic Research Decision Tool",
    "Decision Intelligence",
    "Operations Research",
  ],
  alternates: {
    canonical: "https://www.rankowise.online",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.rankowise.online",
    siteName: "RankoWise",
    title: "RankoWise | Multi-Criteria Decision Intelligence & MCDM Calculator",
    description:
      "Advanced Multi-Criteria Decision Making (MCDM) and Decision support systems platform. Calculate SWEI Method, SWI Method, TOPSIS, VIKOR, AHP, PROMETHEE, and sensitivity analysis for academic research and engineering decisions.",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "RankoWise Platform Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RankoWise | Multi-Criteria Decision Intelligence",
    description:
      "Advanced Multi-Criteria Decision Making (MCDM) & Decision support systems platform featuring SWEI Method, SWI Method, TOPSIS, VIKOR, AHP, and PROMETHEE.",
    images: ["/logo.jpg"],
  },
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
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://www.rankowise.online/#software",
      "name": "RankoWise",
      "url": "https://www.rankowise.online",
      "applicationCategory": "EducationalApplication, BusinessApplication",
      "operatingSystem": "All (Web-based)",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "description":
        "RankoWise is an advanced Multi-Criteria Decision Making (MCDM) and Decision support systems platform for academic researchers, engineering teams, and analysts. Features 25+ ranking algorithms including SWEI MCDM Method, SWI MCDM Method, Decision support systems, TOPSIS, VIKOR, AHP, PROMETHEE, Fuzzy logic, and sensitivity analysis.",
      "featureList": [
        "SWEI MCDM Method & SWI MCDM Method (Novel Weight & Ranking Algorithms)",
        "25+ Multi-Criteria Decision Analysis (MCDM) & Decision support systems",
        "Analytical Hierarchy Process (AHP) Matrix & Consistency Ratio (CR)",
        "Fuzzy Logic & Triangular Fuzzy Numbers (TFN)",
        "Sensitivity Analysis with Dynamic Weight Variations",
        "Monte Carlo Robustness Simulation",
        "Publication-ready Charts & Export (Excel, LaTeX, BibTeX)",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://www.rankowise.online/#website",
      "url": "https://www.rankowise.online",
      "name": "RankoWise",
      "description": "Multi-Criteria Decision Intelligence, SWEI Method, SWI Method & Decision support systems",
      "publisher": {
        "@type": "Organization",
        "name": "RankoWise",
        "url": "https://www.rankowise.online",
        "logo": "https://www.rankowise.online/logo.jpg",
      },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-background" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AnalyticsTracker />
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
