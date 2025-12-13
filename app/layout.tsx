import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wakeandtalk.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "WakeAndTalk - Record and Remember Your Dreams",
    template: "%s | WakeAndTalk",
  },
  description:
    "Capture your dreams with voice recordings. WakeAndTalk transcribes and summarizes your dreams so you can revisit them anytime.",
  keywords: [
    "dream journal",
    "dream recorder",
    "voice recording",
    "dream diary",
    "dream tracking",
    "lucid dreaming",
    "dream interpretation",
  ],
  authors: [{ name: "WakeAndTalk" }],
  creator: "WakeAndTalk",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "WakeAndTalk",
    title: "WakeAndTalk - Record and Remember Your Dreams",
    description:
      "Capture your dreams with voice recordings. WakeAndTalk transcribes and summarizes your dreams so you can revisit them anytime.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WakeAndTalk - Dream Recording App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WakeAndTalk - Record and Remember Your Dreams",
    description:
      "Capture your dreams with voice recordings. WakeAndTalk transcribes and summarizes your dreams so you can revisit them anytime.",
    images: ["/og-image.png"],
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
