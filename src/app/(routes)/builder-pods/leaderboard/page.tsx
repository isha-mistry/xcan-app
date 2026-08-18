"use client";
import React, { useState } from "react";
import useSWR from "swr";
import { Trophy, Users, Sparkles } from "lucide-react";
import PodLeaderboardTable from "@/components/BuilderPods/PodLeaderboardTable";
import IndividualLeaderboardTable from "@/components/BuilderPods/IndividualLeaderboardTable";
import {
  PageShell,
  BackLink,
  PageHero,
  StatPill,
  TabPills,
} from "@/components/BuilderPods/ui";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"pods" | "individuals">("pods");

  const { data: podData, isLoading: podLoading } = useSWR(
    "/api/builder-pods/leaderboard/pods",
    fetcher,
    { revalidateOnFocus: true }
  );

  const { data: indData, isLoading: indLoading } = useSWR(
    "/api/builder-pods/leaderboard/individuals",
    fetcher,
    { revalidateOnFocus: true }
  );

  const podCount = podData?.pods?.length ?? 0;
  const indCount = indData?.individuals?.length ?? 0;

  return (
    <PageShell>
      <BackLink href="/builder-pods">Builder Pods</BackLink>

      <PageHero
        accent="amber"
        badge="Live rankings"
        BadgeIcon={Sparkles}
        title="Leaderboard"
        description="Rankings updated hourly based on deployments, modules, projects, and weekly activity across the Builder Pods network."
        stats={
          <>
            <StatPill
              icon={<Trophy className="h-3.5 w-3.5 text-yellow-400" />}
              label="Pods ranked"
              value={podCount}
            />
            <StatPill
              icon={<Users className="h-3.5 w-3.5 text-blue-400" />}
              label="Builders"
              value={indCount}
            />
          </>
        }
      />

      <div className="mb-6">
        <TabPills
          tabs={[
            { key: "pods", label: "Pod Rankings", icon: Trophy, count: podCount },
            {
              key: "individuals",
              label: "Individual Rankings",
              icon: Users,
              count: indCount,
            },
          ]}
          active={activeTab}
          onChange={setActiveTab}
          variant="solid"
        />
      </div>

      {activeTab === "pods" ? (
        <PodLeaderboardTable
          pods={podData?.pods ?? []}
          isLoading={podLoading}
        />
      ) : (
        <IndividualLeaderboardTable
          individuals={indData?.individuals ?? []}
          isLoading={indLoading}
        />
      )}
    </PageShell>
  );
}
