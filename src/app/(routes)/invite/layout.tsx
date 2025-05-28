import React from "react";
import PageBackgroundPattern from "@/components/ComponentUtils/PageBackgroundPattern"

function InviteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="">
      <PageBackgroundPattern />
      {children}
    </div>
  );
}

export default InviteLayout;
