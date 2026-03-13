import type { Metadata } from "next";
import { Inter, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import SiteChrome from "@/components/SiteChrome";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/sanity/lib/api";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-share-tech-mono",
});

export const metadata: Metadata = {
  title: "Studio Pilz - Creative Technology & Design",
  description: "A creative technology and design studio specializing in web design, development, festival installations, and photography.",
  icons: {
    icon: '/icon.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings = await getSiteSettings()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${shareTechMono.variable} font-sans antialiased text-black dark:text-white`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SiteChrome />
          {children}
          <Footer settings={siteSettings ?? null} />
        </ThemeProvider>
      </body>
    </html>
  );
}
