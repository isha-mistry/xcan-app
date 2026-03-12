import React from "react";
import BuilderPodsRouteNav from "@/components/BuilderPods/BuilderPodsRouteNav";

export default function AdminBuilderPodsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BuilderPodsRouteNav />
      {children}
    </>
  );
}
