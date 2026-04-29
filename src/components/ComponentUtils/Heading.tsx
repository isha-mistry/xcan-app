import React from "react";
import { usePathname } from "next/navigation";

interface TitlesMap {
  [key: string]: string;
}

const titles: TitlesMap = {
  "/ecosystem": "Ecosystem",
  "/lectures": "Lectures",
  "/sessions": "Sessions",
  "/notifications": "Notifications",
  "/profile": "Profile",
  "/invite": "",
  "/claim-rewards": "Claim Rewards",
  "/optimism": "",
  "/arbitrum": "",
  "/builder-pods": "Builder Pods",
  "/builder-pods/register": "Register",
  "/builder-pods/leaderboard": "Leaderboard",
  "/builder-pods/analytics": "Analytics",
  "/builder-pods/showcase": "Showcase",
  "/builder-pods/showcase-submit": "Showcase Submit",
  "/admin/builder-pods": "Admin — Builder Pods",
  "/admin/builder-pods/members": "Admin — Members",
  "/admin/builder-pods/colleges": "Admin — Colleges",
  "/admin/builder-pods/colleges/new": "Admin — Add College",
  "/admin/builder-pods/deployments": "Admin — Deployments",
  "/admin/builder-pods/projects": "Admin — Projects",
  "/admin/builder-pods/lab-events": "Admin — Lab Events",
  "/admin/builder-pods/badges": "Admin — Badges",
  "/admin/builder-pods/showcases": "Admin — Showcases",
  "/admin/builder-pods/milestones": "Admin — Milestones",
  "/admin/builder-pods/audit-logs": "Admin — Audit Logs",
  "/admin/builder-pods/export": "Admin — Export",
  // Add more URL mappings here as needed
};

function Heading() {
  const pathname = usePathname();
  let title = "Xcan";

  Object.keys(titles).forEach((key) => {
    if (pathname === key || pathname.startsWith(key)) {
      title = titles[key];
    }
  });

  return (
    <>
      <div>
        <div className="flex flex-row justify-between items-center mb-6 font-robotoMono xs:px-4">
          <div className="flex gap-4 items-center">
            <div className="text-white font-black text-2xl xs:text-3xl md:text-4xl font-unbounded tracking-tighter">
              {title}
            </div>
          </div>
          {/* <div className="flex gap-1 xs:gap-2 items-center font-robotoMono"> */}
            {/* <RewardButton /> */}
            {/* <ConnectWalletWithENS /> */}
          {/* </div> */}
        </div>
      </div>
    </>
  );
}

export default Heading;
