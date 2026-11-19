import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { FeedbackWidget } from "@/components/feedback-widget";
import { LocaleProvider } from "@/components/locale-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter-family",
});

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display-family",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-family",
});

export const metadata: Metadata = {
  title: "SignDealDocs | Proposals, E-Signatures & Client Onboarding",
  description:
    "Create client proposals, collect electronic signatures, and request onboarding documents through a single private link.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="saas-grid-bg min-h-full text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
        <LocaleProvider>{children}<FeedbackWidget /></LocaleProvider>
      </body>
    </html>
  );
}
