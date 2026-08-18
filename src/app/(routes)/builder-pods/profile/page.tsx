"use client";

import React from "react";
import { User, Sparkles } from "lucide-react";
import ProfilePodSection from "@/components/BuilderPods/ProfilePodSection";
import {
  PageShell,
  BackLink,
  PageHero,
} from "@/components/BuilderPods/ui";

export default function BuilderPodsProfilePage() {
  return (
    <PageShell>
      <BackLink href="/builder-pods">Builder Pods</BackLink>
      <PageHero
        accent="purple"
        badge="Your participation"
        BadgeIcon={Sparkles}
        title="Builder Pods Profile"
        description="View your pod memberships, roles, scores, and badges across the network."
        actions={
          <span className="inline-flex items-center gap-1.5 text-[10px] text-white/40 font-robotoMono">
            <User className="h-3.5 w-3.5" />
            Linked to your connected wallet
          </span>
        }
      />
      <ProfilePodSection />
    </PageShell>
  );
}
