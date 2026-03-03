"use client";
import React from "react";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Heading from "@/components/ComponentUtils/Heading";
import RegistrationForm from "@/components/BuilderPods/RegistrationForm";

export default function RegisterPage() {
    const { user } = usePrivy();
    const walletAddress = user?.wallet?.address ?? null;

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Link
                href="/builder-pods"
                className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 font-robotoMono mb-6 transition-colors"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                Builder Pods
            </Link>
            <Heading />
            <RegistrationForm walletAddress={walletAddress} />
        </div>
    );
}
