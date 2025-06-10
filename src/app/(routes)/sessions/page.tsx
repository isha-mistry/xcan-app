import React from "react";
import DelegateSessionsMain from "@/components/DelegateSessions/DelegateSessionsMain";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://arbitrum-university.vercel.app/"),
  title: "Arbitrum University",
  description: "Discover. Learn. Engage.",
  openGraph: {
    title: "Available Experts",
    description:
      "Explore available uses by date, and time to book sessions and unlock Web3 opportunities.",
    url: "https://arbitrum-university.vercel.app/available-delegates",
    siteName: "Arbitrum University",
    // images: [
    //   {
    //     url: "https://gateway.lighthouse.storage/ipfs/QmUEoQqvoYbfp9ZD3AHzDNBYTmwovDifVBxWByzr8mMKnT",
    //     width: 800,
    //     height: 600,
    //     alt: "img",
    //   },
    //   {
    //     url: "https://gateway.lighthouse.storage/ipfs/QmUEoQqvoYbfp9ZD3AHzDNBYTmwovDifVBxWByzr8mMKnT",
    //     width: 1800,
    //     height: 1600,
    //     alt: "img",
    //   },
    // ],
    locale: "en_US",
    type: "website",
  },
};

function page() {
  return (
    <>
      <DelegateSessionsMain />
    </>
  );
}

export default page;
