// Shared types for Builder Pods feature

export interface CollegeData {
    _id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
    podName: string;
    memberCount: number;
    activeMemberCount: number;
    projectCount: number;
    deploymentCount: number;
    pendingProjectCount?: number;
    approvedProjectCount?: number;
    showcaseReadyProjectCount?: number;
    status: "active" | "inactive" | "alumni";
    tier?: string;
    regionSnapshot?: { name: string; showcaseCity: string };
    activatedAt?: string | null;
    facultyCoordinator?: string | null;
    logoUrl?: string | null;
}

export interface MemberData {
    _id: string;
    walletAddress: string;
    name: string;
    role: string;
    requestedRole?: string | null;
    programmingLevel: string | null;
    githubUsername: string | null;
    status: string;
    stylusModulesCompleted: number;
    contractsDeployed: number;
    activeProjectCount?: number;
    totalScore: number;
    individualRank?: number | null;
}

export interface TeamMember {
    walletAddress: string;
    name: string;
    role: "team_leader" | "team_member";
    joinedAt: string;
}

export interface ProjectData {
    _id: string;
    name: string;
    problemStatement: string;
    githubRepo: string | null;
    contractAddress: string | null;
    demoLink: string | null;
    techStack: string[];
    status: string;
    isApproved: boolean;
    teamCode?: string;
    teamLeader?: string;
    teamMembers?: TeamMember[];
    createdBy?: string;
    createdAt: string;
    submittedToShowcase?: boolean;
}

export const PROJECT_STATUS_ORDER = [
    'ideation',
    'architecture_finalized',
    'prototype',
    'deployed',
    'demo_ready',
] as const;

export type ProjectStatus = typeof PROJECT_STATUS_ORDER[number];

export interface PodScore {
    _id: string;
    collegeId: {
        _id: string;
        name: string;
        slug: string;
        city: string;
        state: string;
        podName: string;
        status: string;
    };
    totalScore: number;
    totalDeployments: number;
    totalModuleCompletions: number;
    projectStatusScore: number;
    weeklyActivityScore: number;
    activeMembersCount: number;
    totalMembersCount: number;
    rank: number | null;
}

export interface IndividualScore {
    _id: string;
    walletAddress: string;
    name: string;
    role: string;
    totalScore: number;
    individualRank: number | null;
    stylusModulesCompleted: number;
    contractsDeployed: number;
    weeklyActivityScore: number;
    projectContributionScore: number;
    collegeId: { name: string; slug: string; podName: string } | null;
}

export interface StatsData {
    totalColleges: number;
    totalMembers: number;
    totalActiveMembers: number;
    totalDeployments: number;
    totalProjects: number;
}

export interface UpdateData {
    _id: string;
    submittedBy: string;
    targetProjectId?: string;
    weekNumber: number;
    year: number;
    completedThisWeek: string;
    blockers: string | null;
    nextMilestone: string;
    githubLink: string | null;
    reviewedBy: string | null;
    createdAt: string;
}

export interface MembershipEntry {
    member: {
        name?: string | null;
        role?: string | null;
        displayRole?: string | null;
        displayRoleLabel?: string | null;
        status?: string | null;
        programmingLevel?: string | null;
        githubUsername?: string | null;
        stylusModulesCompleted?: number | null;
        contractsDeployed?: number | null;
        totalScore?: number | null;
        individualRank?: number | null;
        joinedAt?: string | null;
    };
    college: {
        _id?: string;
        slug?: string | null;
        podName?: string | null;
        name?: string | null;
        city?: string | null;
        state?: string | null;
    } | null;
    projectCount?: number;
}

export interface BadgeEntry {
    _id: string;
    slug?: string | null;
    label?: string | null;
    easUid?: string | null;
}

export interface CollegeOption {
    _id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
}

export interface ConfirmActionModalProps {
    title: string;
    message: string;
    actionLabel: string;
    actionColor: string;
    icon: React.ComponentType<{ className?: string }>;
    submitting: boolean;
    onConfirm: () => void;
    onClose: () => void;
}
