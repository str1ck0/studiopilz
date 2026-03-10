import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { ThemeProvider } from "@/components/ThemeProvider";
import GrainientBackground from "@/components/GrainientBackground";

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
          <GrainientBackground />
          <Navigation />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
