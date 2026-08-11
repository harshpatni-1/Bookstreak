import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const body = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://bookstreak.com"),
  title: "BookStreak — read every day",
  description: "A privacy-first reading habit tracker. Build streaks, finish more books.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "BookStreak — read every day",
    description: "A privacy-first reading habit tracker. Build daily streaks, finish more books.",
    url: "https://bookstreak.com",
    siteName: "BookStreak",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BookStreak — Read every day. Finish more books.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BookStreak — read every day",
    description: "A privacy-first reading habit tracker. Build daily streaks, finish more books.",
    images: ["/twitter-image.png"],
    creator: "@bookstreak",
  },
};

export const viewport: Viewport = {
  themeColor: "#3478f6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable}`}
    >
      <head>
        {/*
          Apply persisted display preferences before first paint.

          Text size and contrast are applied here — not in a React effect —
          because a reader who needs 125% text should never see a frame of 100%
          text, and a reflow after paint is disorienting for exactly the people
          the setting exists for.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var e=document.documentElement;var t=localStorage.getItem('bs-theme');e.classList.toggle('dark',t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches));var s=localStorage.getItem('bs-text');if(s==='large'||s==='xl')e.setAttribute('data-text',s);var c=localStorage.getItem('bs-contrast');if(c==='high'||matchMedia('(prefers-contrast:more)').matches)e.setAttribute('data-contrast','high');}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
