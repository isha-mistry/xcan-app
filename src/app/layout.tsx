import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import localFonts from "next/font/local";
import "./globals.css";
import RootProviders from "./providers/root-providers";
import { Suspense } from "react";
import ProgressBarProvider from "@/components/ProgressBarProvider/ProgressBarProvider";
import SidebarMainMobile from "@/components/MainSidebar/SidebarMainMobile";
import TopNavbar from "@/components/TopNavbar/TopNavbar";
import RouteProtectionWrapper from "@/components/RouteProtectionWrapper";
import { Toaster } from "react-hot-toast";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://inorbit-edu.vercel.app/"),
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
    description: "Discover. Learn. Engage.",
    url: "https://inorbit-app.vercel.app/",
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
      <body className={`${robotoMono.variable} bg-dark-primary text-dark-text-primary`}>
        <ProgressBarProvider>
          <Suspense>
            <RootProviders>
              <RouteProtectionWrapper>
                <div className="">
                  <div className="lg:hidden w-full bg-dark-secondary border border-dark-accent">
                    <SidebarMainMobile />
                  </div>
                  <div className="hidden lg:flex items-center bg-dark-secondary ">
                    <TopNavbar />
                  </div>
                  <div className="pt-6">
                    {children}
                  </div>
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
