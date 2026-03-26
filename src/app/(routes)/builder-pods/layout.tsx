import React from "react";
import BuilderPodsRouteNav from "@/components/BuilderPods/BuilderPodsRouteNav";

export default function BuilderPodsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="lg:hidden">
        <BuilderPodsRouteNav />
      </div>
      <div className="min-h-[550px]">
        {children}
      </div>
    </>
  );
}
