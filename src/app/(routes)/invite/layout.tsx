import React from "react";
import PageBackgroundPattern from "@/components/ComponentUtils/PageBackgroundPattern"

function InviteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700">
      <PageBackgroundPattern />
      {children}
    </div>
  );
}

export default InviteLayout;
