"use client";
import React, { Suspense } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSearchParams } from "next/navigation";
import { ClipboardCheck, Sparkles } from "lucide-react";
import RegistrationForm from "@/components/BuilderPods/RegistrationForm";
import {
  PageShell,
  BackLink,
  PageHero,
} from "@/components/BuilderPods/ui";

function RegisterContent() {
  const { user } = usePrivy();
  const walletAddress = user?.wallet?.address ?? null;
  const searchParams = useSearchParams();
  const initialQrToken = searchParams.get("token") ?? "";

  return (
    <PageShell>
      <BackLink href="/builder-pods">Builder Pods</BackLink>
      <PageHero
        accent="blue"
        badge="Join the network"
        BadgeIcon={Sparkles}
        title="Register"
        description="Join a Builder Lab, connect your wallet, and become part of a college pod building on Arbitrum."
        actions={
          <span className="inline-flex items-center gap-1.5 text-[10px] text-white/40 font-robotoMono">
            <ClipboardCheck className="h-3.5 w-3.5" />
            QR tokens from lab events auto-fill below
          </span>
        }
      />
      <RegistrationForm
        walletAddress={walletAddress}
        initialQrToken={initialQrToken}
      />
    </PageShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <PageShell>
          <div className="glass-container h-64 animate-pulse rounded-2xl" />
        </PageShell>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
