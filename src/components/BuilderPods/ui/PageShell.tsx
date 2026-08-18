import React from "react";

export function PageShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6 ${className}`}
    >
      {children}
    </div>
  );
}
