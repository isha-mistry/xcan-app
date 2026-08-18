"use client";

import React from "react";
import { Shield } from "lucide-react";
import { BackLink } from "./BackLink";
import { PageHero, PageHeroAccent } from "./PageHero";

export function AdminPageHero({
  title,
  description,
  stats,
  actions,
  accent = "amber",
  showBack = true,
  badge = "Admin control center",
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  stats?: React.ReactNode;
  actions?: React.ReactNode;
  accent?: PageHeroAccent;
  showBack?: boolean;
  badge?: string;
}) {
  return (
    <>
      {showBack && (
        <BackLink href="/admin/builder-pods">Admin Dashboard</BackLink>
      )}
      <PageHero
        accent={accent}
        badge={badge}
        BadgeIcon={Shield}
        title={title}
        description={description}
        stats={stats}
        actions={actions}
      />
    </>
  );
}
