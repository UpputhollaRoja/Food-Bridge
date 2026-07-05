import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";
import Script from "next/script";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Food Bridge — AI-Powered Food Waste Redistribution",
  description: "Recovering food surplus and delivering it to those who need it most, powered by AI matching and logistics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${nunito.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col relative overflow-x-hidden antialiased transition-colors duration-300">
        {/* Apply saved theme before React hydrates — prevents flash & hydration mismatch */}
        <Script id="theme-init" strategy="beforeInteractive">{`
          (function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();
        `}</Script>
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
