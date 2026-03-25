import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://neurowealth.app"),
  title: {
    default: "NeuroWealth — AI-Powered Yield on Stellar",
    template: "%s | NeuroWealth",
  },
  description:
    "NeuroWealth is an autonomous AI agent that deploys your USDC into the highest-yielding DeFi opportunities on Stellar — automatically, 24/7. No DeFi knowledge required.",
  keywords: [
    "DeFi",
    "Stellar",
    "yield farming",
    "AI agent",
    "USDC",
    "automated investing",
    "Soroban",
    "blockchain",
    "passive income",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "NeuroWealth",
    title: "NeuroWealth — AI-Powered Yield on Stellar",
    description:
      "Autonomous AI yield optimization on Stellar DeFi. Deposit USDC, earn automatically.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NeuroWealth — AI-Powered Yield on Stellar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuroWealth — AI-Powered Yield on Stellar",
    description:
      "Autonomous AI yield optimization on Stellar DeFi. Deposit USDC, earn automatically.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
