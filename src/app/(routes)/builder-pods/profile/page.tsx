"use client";

import React from "react";
import { useAccount } from "wagmi";
import Heading from "@/components/ComponentUtils/Heading";
import ProfilePodSection from "@/components/BuilderPods/ProfilePodSection";

export default function BuilderPodsProfilePage() {

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
      <Heading />
      <div className="mt-6 min-h-[550px]">
        <ProfilePodSection />
      </div>
    </div>
  );
}

