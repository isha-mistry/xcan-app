import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFonts from "next/font/local";
import "./globals.css";
// import { NextUIProvider } from "@nextui-org/react";
import SidebarMain from "@/components/MainSidebar/SidebarMain";
import RootProviders from "./providers/root-providers";
// import HuddleContextProvider from "@/context/HuddleContextProvider";
import { Suspense, useEffect } from "react";
import FeedbackTile from "@/components/ComponentUtils/FeedbackTile";
import Script from "next/script";
import ProgressBarProvider from "@/components/ProgressBarProvider/ProgressBarProvider";
import MobileResponsiveMessage from "@/components/MobileResponsiveMessage/MobileResponsiveMessage";
import { GoogleTagManager } from "@next/third-parties/google";
import SidebarMainMobile from "@/components/MainSidebar/SidebarMainMobile";
import { ApiDataProvider } from "@/contexts/ApiDataContext";
import TopNavbar from "@/components/TopNavbar/TopNavbar";
import { Toaster } from "react-hot-toast";
import AuthGuard from "@/components/ComponentUtils/AuthGuard";
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const quanty = localFonts({
  src: [
    {
      path: "../assets/fonts/quanty.ttf",
    },
  ],
  variable: "--font-quanty",
});

// export const metadata: Metadata = {
//   title: "Chora Club",
//   description: "Discover. Learn. Engage.",
//   icons: {
//     icon: ["/favicon.png"],
//   },
// };
export const metadata: Metadata = {
  metadataBase: new URL("https://app.chora.club/"),
  title: "Chora Club",
  description: "Discover. Learn. Engage.",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ChoraClub PWA'
  },
  manifest: '/manifest.json',
  icons: {
    icon: ["/favicon.png"],
    apple: [{ url: "/favicon.png" }],
  },
  openGraph: {
    title: "Chora Club",
    description: "Discover. Learn. Engage.",
    url: "https://app.chora.club/",
    siteName: "Chora Club",

    images: [
      {
        url: "https://gateway.lighthouse.storage/ipfs/QmZmWxpdhQZnag8HZtwZPLR5wtK2jjfgsTBMpNpmijtZ5x",
        width: 800,
        height: 600,
        alt: "img",
      },
      {
        url: "https://gateway.lighthouse.storage/ipfs/QmZmWxpdhQZnag8HZtwZPLR5wtK2jjfgsTBMpNpmijtZ5x",
        width: 1800,
        height: 1600,
        alt: "img",
      },
    ],
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
        {/* <script
          dangerouslySetInnerHTML={{
            __html: `
       (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-W5684W77');
          `,
          }}
        ></script> */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-MGZWXWQW');

            `,
          }}
        ></script>
      </head>
      <body className={`${quanty.variable} ${poppins.variable}`}>
        {/* <noscript
          dangerouslySetInnerHTML={{
            __html: `
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MGZWXWQW"
          height="0" width="0" style="display:none;visibility:hidden"></iframe>
        `,
          }}
        /> */}
        <ProgressBarProvider>
          <Suspense>
            <RootProviders>
              <ApiDataProvider>
                <div className="flex">
                  {/* <div className="hidden lg:block fixed w-[6%] bg-blue-shade-100 h-screen z-10">
                    <SidebarMain />
                  </div>*/}
                  <div className="lg:hidden fixed z-10 w-full bg-white border border-b-0">
                    <SidebarMainMobile />
                  </div>
                  <div className="hidden lg:flex items-center fixed h-[60px] bg-blue-shade-100 w-screen z-10">
                    <TopNavbar />
                  </div>
                  <div className="w-[100%] ml-auto mt-[78px] sm:mt-[64px] lg:mt-[60px] z-0">
                    <FeedbackTile />
                    <AuthGuard>{children}</AuthGuard>
                  </div>
                </div>
              </ApiDataProvider>
            </RootProviders>
          </Suspense>
        </ProgressBarProvider>
        <Toaster
          toastOptions={{
            style: {
              fontSize: "14px",
              backgroundColor: "#3E3D3D",
              color: "#fff",
              boxShadow: "none",
              borderRadius: "50px",
              padding: "3px 5px",
            },
          }}
        />
      </body>
      <GoogleTagManager gtmId="GTM-MGZWXWQW" />
    </html>
  );
}
