import type { Metadata } from "next";
import { Instrument_Serif, Fira_Code, Geist } from "next/font/google";
import "./globals.css";
import { GrainOverlay } from "@/components/GrainOverlay";

const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GitGarden — commit as plants",
  description: "Turn any GitHub repository's commit history into a generative pixel-art garden. Every commit is a plant.",
  openGraph: {
    title: "GitGarden",
    description: "Every commit is a plant. Every repo, a garden.",
    siteName: "GitGarden",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitGarden",
    description: "Every commit is a plant. Every repo, a garden.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${firaCode.variable} ${geist.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GrainOverlay />
        {children}
      </body>
    </html>
  );
}
