import type { Metadata } from "next";
import { Poppins, Tektur } from "next/font/google";
import localFonts from "next/font/local";
import "./globals.css";
import RootProviders from "./providers/root-providers";
import { Suspense } from "react";
import ProgressBarProvider from "@/components/ProgressBarProvider/ProgressBarProvider";
import SidebarMainMobile from "@/components/MainSidebar/SidebarMainMobile";
import TopNavbar from "@/components/TopNavbar/TopNavbar";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-tektur",
});
// const quanty = localFonts({
//   src: [
//     {
//       path: "../assets/fonts/quanty.ttf",
//     },
//   ],
//   variable: "--font-quanty",
// });

export const metadata: Metadata = {
  metadataBase: new URL("https://stylus-university.vercel.app/"),
  title: "Arbitrum University",
  description: "Discover. Learn. Engage.",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Arbitrum University PWA'
  },
  manifest: '/manifest.json',
  icons: {
    icon: ["/favicon.png"],
    apple: [{ url: "/favicon.png" }],
  },
  openGraph: {
    title: "Arbitrum University",
    description: "Discover. Learn. Engage.",
    url: "https://stylus-university.vercel.app/",
    siteName: "Arbitrum University",

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
      <body className={`${tektur.variable} ${poppins.variable} bg-dark-primary text-dark-text-primary`}>
        <ProgressBarProvider>
          <Suspense>
            <RootProviders>
              <div className="flex">
                <div className="lg:hidden fixed z-10 w-full bg-dark-secondary border border-dark-accent">
                  <SidebarMainMobile />
                </div>
                <div className="hidden lg:flex items-center fixed h-[60px] bg-dark-secondary w-screen z-10">
                  <TopNavbar />
                </div>
                <div className="w-[100%] ml-auto mt-[78px] sm:mt-[64px] lg:mt-[60px] z-0">
                  {children}
                </div>
              </div>
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
