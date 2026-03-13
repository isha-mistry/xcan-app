import React from "react";
import BuilderPodsRouteNav from "@/components/BuilderPods/BuilderPodsRouteNav";

export default function BuilderPodsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BuilderPodsRouteNav />
      <div className="min-h-[550px]">
        {children}
      </div>
    </>
  );
}
