import type { Metadata } from "next";
import { Roboto_Mono, Unbounded } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import RootProviders from "./providers/root-providers";
import { Suspense } from "react";
import ProgressBarProvider from "@/components/ProgressBarProvider/ProgressBarProvider";
import SidebarMainMobile from "@/components/MainSidebar/SidebarMainMobile";
import TopNavbar from "@/components/TopNavbar/TopNavbar";
import RouteProtectionWrapper from "@/components/RouteProtectionWrapper";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/Footer/Footer";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-roboto-mono",
});

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
});

const quanty = localFont({
  src: "../assets/fonts/quanty.ttf",
  variable: "--font-quanty",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://xcan.dev/"),
  title: "Xcan",
  description: "Discover. Learn. Engage.",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Xcan PWA'
  },
  manifest: '/manifest.json',
  icons: {
    icon: ["/favicon.png"],
    apple: [{ url: "/favicon.png" }],
  },
  openGraph: {
    title: "Xcan",
    description: "Learn. Experience. Build.",
    url: "https://xcan.dev/",
    siteName: "Xcan",

    // images: [
    //   {
    //     url: "https://gateway.lighthouse.storage/ipfs/QmZmWxpdhQZnag8HZtwZPLR5wtK2jjfgsTBMpNpmijtZ5x",
    //     width: 800,
    //     height: 600,
    //     alt: "img",
    //   },
    //   {
    //     url: "https://gateway.lighthouse.storage/ipfs/QmZmWxpdhQZnag8HZtwZPLR5wtK2jjfgsTBMpNpmijtZ5x",
    //     width: 1800,
    //     height: 1600,
    //     alt: "img",
    //   },
    // ],

    locale: "en_US",
    type: "website",
  },

};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className={`${robotoMono.variable} ${unbounded.variable} ${quanty.variable} bg-dark-primary text-dark-text-primary`}>
        <ProgressBarProvider>
          <Suspense>
            <RootProviders>
              <RouteProtectionWrapper>
                <div className="relative">
                  <SidebarMainMobile />
                  <div className="sticky top-0 z-[100]">
                    <TopNavbar />
                  </div>
                  <div className="pt-0">
                    {children}
                  </div>
                  <Footer />
                </div>
              </RouteProtectionWrapper>
            </RootProviders>
          </Suspense>
        </ProgressBarProvider>
        <Toaster
          toastOptions={{
            style: {
              fontSize: "14px",
              backgroundColor: "#2d2d2d",
              color: "#ffffff",
              boxShadow: "none",
              borderRadius: "50px",
              padding: "3px 5px",
            },
          }}
        />
      </body>
    </html>
  );
}
