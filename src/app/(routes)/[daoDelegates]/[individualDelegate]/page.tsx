import SpecificDelegate from "@/components/IndividualDelegate/SpecificDelegate";
import { BASE_URL } from "@/config/constants";
import {
  getMetadataEnsData,
} from "@/utils/ENSUtils";
import { Metadata } from "next";
import React from "react";
import { getFrameMetadata } from "@coinbase/onchainkit/core";
import { IMAGE_URL } from "@/config/staticDataUtils";

interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

export async function generateMetadata({
  params,
}: {
  params: Type;
}): Promise<Metadata> {
  const name = "Arbitrum University";

  return {
    title: name,
    description: "Arbitrum University",
    openGraph: {
      title: name,
      description: "Delegate",
    },
  };
}



function page({ params }: { params: Type }) {
  return (
    <div>
      <SpecificDelegate props={params} />
    </div>
  );
}

export default page;
