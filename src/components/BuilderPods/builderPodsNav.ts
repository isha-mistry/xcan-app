import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Download,
  FolderKanban,
  Home,
  LineChart,
  Presentation,
  Rocket,
  ScrollText,
  Shield,
  Sparkles,
  Target,
  Trophy,
  User,
  Users,
} from "lucide-react";

export type BuilderPodsNavItem = {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
};

export const builderPodsPrimaryItems: BuilderPodsNavItem[] = [
  {
    label: "Landing",
    href: "/builder-pods",
    description: "Start from the Builder Pods overview and ecosystem entry point.",
    icon: Home,
  },
  {
    label: "Leaderboard",
    href: "/builder-pods/leaderboard",
    description: "Track college and individual rankings across the network.",
    icon: Trophy,
  },
  {
    label: "Showcase",
    href: "/builder-pods/showcase",
    description: "Explore regional showcases and the latest pod submissions.",
    icon: Presentation,
  },
  {
    label: "Analytics",
    href: "/builder-pods/analytics",
    description: "Review participation, activity, and program performance.",
    icon: LineChart,
  },
];

export const builderPodsActionItems: BuilderPodsNavItem[] = [
  {
    label: "Register",
    href: "/builder-pods/register",
    description: "Join Builder Pods through the registration flow or event QR.",
    icon: ClipboardCheck,
  },
  {
    label: "Submit Showcase",
    href: "/builder-pods/showcase-submit",
    description: "Send a finished project to a regional showcase for review.",
    icon: Presentation,
  },
];

export const builderPodsAdminItems: BuilderPodsNavItem[] = [
  {
    label: "Admin Dashboard",
    href: "/admin/builder-pods",
    description: "Monitor the overall Builder Pods program from one place.",
    icon: Shield,
  },
  {
    label: "Colleges",
    href: "/admin/builder-pods/colleges",
    description: "Manage participating colleges and their pod configuration.",
    icon: Building2,
  },
  {
    label: "Members",
    href: "/admin/builder-pods/members",
    description: "Approve members, roles, and contribution states.",
    icon: Users,
  },
  {
    label: "Projects",
    href: "/admin/builder-pods/projects",
    description: "Review project pipelines, status, and approvals.",
    icon: FolderKanban,
  },
  {
    label: "Deployments",
    href: "/admin/builder-pods/deployments",
    description: "Inspect submitted deployments and deployment status.",
    icon: Rocket,
  },
  {
    label: "Lab Events",
    href: "/admin/builder-pods/lab-events",
    description: "Manage labs, QR onboarding, and scheduled pod events.",
    icon: CalendarDays,
  },
  {
    label: "Badges",
    href: "/admin/builder-pods/badges",
    description: "Assign, attest, and audit Builder Pods badge activity.",
    icon: BadgeCheck,
  },
  {
    label: "Showcases",
    href: "/admin/builder-pods/showcases",
    description: "Review showcase events and submitted entries.",
    icon: Presentation,
  },
  {
    label: "Milestones",
    href: "/admin/builder-pods/milestones",
    description: "Track milestone completion and internal KPI progress.",
    icon: Target,
  },
  {
    label: "Audit Logs",
    href: "/admin/builder-pods/audit-logs",
    description: "Inspect administrative changes across the program.",
    icon: ScrollText,
  },
  {
    label: "Export",
    href: "/admin/builder-pods/export",
    description: "Generate program reports and export operational data.",
    icon: Download,
  },
  {
    label: "Add College",
    href: "/admin/builder-pods/colleges/new",
    description: "Create a new college workspace and map its event setup.",
    icon: Sparkles,
  },
];

export function getBuilderPodsPersonalItems(options: {
  address?: string | null;
  myCollegeSlug?: string;
}): BuilderPodsNavItem[] {
  const items: BuilderPodsNavItem[] = [];

  if (options.myCollegeSlug) {
    items.push({
      label: "My Pod",
      href: `/builder-pods/${options.myCollegeSlug}`,
      description: "Jump directly into your college pod workspace and updates.",
      icon: Sparkles,
    });
  }

  if (options.address) {
    items.push({
      label: "Profile",
      href: "/builder-pods/profile",
      description: "View your Builder Pods profile, roles, and earned badges.",
      icon: User,
    });
  }

  return items;
}
