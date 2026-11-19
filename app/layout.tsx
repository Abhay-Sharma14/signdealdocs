import type { Metadata } from "next";
import {siteUrl} from "@/lib/site-url";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import {FeedbackWidget} from "@/components/feedback-widget";
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
 metadataBase:siteUrl(),
 title:{default:"SignDealDocs | Client Deal Rooms, E-Signatures & Proposals",template:"%s | SignDealDocs"},
 description:"Create branded client deal rooms, share proposals, collect electronic signatures, request onboarding documents, and manage payment steps in one place.",
 applicationName:"SignDealDocs",
 alternates:{canonical:"/",languages:{"en":"/","fr":"/fr","de":"/de","ja":"/ja"}},
 openGraph:{type:"website",siteName:"SignDealDocs",url:"/",title:"SignDealDocs | Client Deal Rooms & E-Signatures",description:"Share proposals, collect e-signatures, and organize client onboarding in one deal room."},
 twitter:{card:"summary",title:"SignDealDocs | Client Deal Rooms & E-Signatures",description:"Proposals, electronic signatures, and client onboarding in one deal room."},
 robots:{index:true,follow:true},
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
      className={`${inter.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="saas-grid-bg min-h-full text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
        <LocaleProvider>{children}<FeedbackWidget/></LocaleProvider>
      </body>
    </html>
  );
}
