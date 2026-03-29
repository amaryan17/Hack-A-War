import type { Metadata } from "next";
import { Space_Mono, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import { Lightning } from "@/components/ui/hero-odyssey";
import "./globals.css";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Aegis Migration Factory",
  description: "Autonomous AI platform migrates legacy GCP infrastructure to AWS.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛡️</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${spaceMono.variable} ${ibmPlexSans.variable} ${jetbrainsMono.variable} font-body bg-transparent text-text-primary antialiased relative`}
      >
        <div className="fixed inset-0 z-[-1] pointer-events-none opacity-60">
          <Lightning hue={220} speed={1.5} intensity={0.5} size={2} />
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
