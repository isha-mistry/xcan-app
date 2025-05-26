import RewardsMain from "@/components/ClaimReward/RewardsMain";
import PageBackgroundPattern from "@/components/ComponentUtils/PageBackgroundPattern";
import React from "react";
function page() {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700">
      <PageBackgroundPattern />
      <RewardsMain />
    </div>
  );
}

export default page;
