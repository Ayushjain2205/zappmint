import type { Metadata } from "next";
import PlausibleProvider from "next-plausible";
import "./globals.css";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";

let title = "Zappmint –  Mint your idea";
let description = "Generate your next app with Llama 3.1 405B";
let url = "https://zappmint.com/";
let ogimage = "https://zappmint.com/og-image.png";
let sitename = "zappmint.com";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <PlausibleProvider domain="zappmint.com" />
      </head>
      <body>
        <MiniKitProvider>{children}</MiniKitProvider>
      </body>
    </html>
  );
}
