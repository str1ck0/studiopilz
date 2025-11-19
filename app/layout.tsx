import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import ThreeBackground from "@/components/ThreeBackground";

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
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-white text-black dark:bg-black dark:text-white`}>
        <ThreeBackground />
        <Navigation />
        {children}
      </body>
    </html>
  );
}
