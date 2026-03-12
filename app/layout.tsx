import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import SiteChrome from "@/components/SiteChrome";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Studio Pilz - Creative Technology & Design",
  description: "A creative technology and design studio specializing in web design, development, festival installations, and photography.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased text-black dark:text-white`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SiteChrome />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
