import DaoOfficeHours from "@/components/OfficeHours/DaoOfficeHours";
import React from "react";
import type { Metadata } from "next";
import WalletWrapper from "@/components/WalletWrapper";

export const metadata: Metadata = {
  metadataBase: new URL("https://inorbit-edu.vercel.app/"),
  title: "Inorbit",
  description: "Discover. Learn. Engage.",
  openGraph: {
    title: "Lectures",
    description:
      "Find all the current, upcoming, and past lectures hosted by experts, and easily search them by using Title or Host Address.",
    url: "https://inorbit-edu.vercel.app/lectures?hours=ongoing",
    siteName: "Inorbit",
    // images: [
    //   {
    //     url: "https://gateway.lighthouse.storage/ipfs/QmPjZZxacLkRM1kPSBMmyV45MUtCHJPAPYW21cSds8gUet",
    //     width: 800,
    //     height: 600,
    //     alt: "img",
    //   },
    //   {
    //     url: "https://gateway.lighthouse.storage/ipfs/QmPjZZxacLkRM1kPSBMmyV45MUtCHJPAPYW21cSds8gUet",
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
    <WalletWrapper>
      <div>
        <DaoOfficeHours />
      </div>
    </WalletWrapper>
  );
}

export default page;
