import type { Metadata } from "next";
import { Inter, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { ThemeProvider } from "@/components/ThemeProvider";
import GrainientBackground from "@/components/GrainientBackground";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${shareTechMono.variable} font-sans antialiased text-black dark:text-white`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <GrainientBackground />
          <Navigation />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
