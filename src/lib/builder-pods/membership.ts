export const WEEKLY_UPDATE_LEAD_ROLES = ['pod_lead', 'tech_lead'] as const;

type DateLike = Date | string | null | undefined;

interface WeeklyUpdateLeadLike {
    role?: string | null;
    status?: string | null;
}

interface MembershipPriorityLike {
    status?: string | null;
    approvedAt?: DateLike;
    createdAt?: DateLike;
}

interface PopulatedCollegeLike {
    _id: { toString(): string } | string;
    name?: string | null;
    slug?: string | null;
    podName?: string | null;
    city?: string | null;
    state?: string | null;
}

interface ProfileMemberLike extends MembershipPriorityLike {
    collegeId: { toString(): string } | string | PopulatedCollegeLike;
    name?: string | null;
    role?: string | null;
    programmingLevel?: string | null;
    githubUsername?: string | null;
    status?: string | null;
    stylusModulesCompleted?: number | null;
    contractsDeployed?: number | null;
    totalScore?: number | null;
    individualRank?: number | null;
}

export interface SerializedProfileMembership {
    member: {
        name: string | null;
        role: string | null;
        status: string | null;
        programmingLevel: string | null;
        githubUsername: string | null;
        stylusModulesCompleted: number;
        contractsDeployed: number;
        totalScore: number;
        individualRank: number | null;
        joinedAt: DateLike;
    };
    college: PopulatedCollegeLike | null;
    projectCount: number;
}

const weeklyUpdateLeadRoleSet = new Set<string>(WEEKLY_UPDATE_LEAD_ROLES);

function toTimestamp(value: DateLike): number {
    if (!value) return 0;
    const timestamp = value instanceof Date ? value.getTime() : new Date(value).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
}

function compareNumbersDesc(a: number, b: number): number {
    return b - a;
}

function isPopulatedCollege(value: ProfileMemberLike['collegeId']): value is PopulatedCollegeLike {
    return Boolean(
        value &&
        typeof value === 'object' &&
        '_id' in value &&
        ('slug' in value || 'name' in value || 'podName' in value || 'city' in value || 'state' in value)
    );
}

function getCollegeKey(value: ProfileMemberLike['collegeId']): string {
    if (isPopulatedCollege(value)) {
        return value._id.toString();
    }
    return value.toString();
}

export function isWeeklyUpdateLeadRole(role: string | null | undefined): boolean {
    return typeof role === 'string' && weeklyUpdateLeadRoleSet.has(role);
}

export function isActiveWeeklyUpdateLead(member: WeeklyUpdateLeadLike | null | undefined): boolean {
    return Boolean(member && member.status === 'active' && isWeeklyUpdateLeadRole(member.role));
}

export function sortMembershipsByPriority<T extends MembershipPriorityLike>(memberships: T[]): T[] {
    return [...memberships].sort((a, b) => {
        const activeSort = compareNumbersDesc(
            a.status === 'active' ? 1 : 0,
            b.status === 'active' ? 1 : 0
        );
        if (activeSort !== 0) return activeSort;

        const approvedAtSort = compareNumbersDesc(
            toTimestamp(a.approvedAt),
            toTimestamp(b.approvedAt)
        );
        if (approvedAtSort !== 0) return approvedAtSort;

        return compareNumbersDesc(toTimestamp(a.createdAt), toTimestamp(b.createdAt));
    });
}

export function pickPrimaryMembership<T extends MembershipPriorityLike>(memberships: T[]): T | null {
    return sortMembershipsByPriority(memberships)[0] ?? null;
}

export function serializeProfileMemberships(
    members: ProfileMemberLike[],
    collegeMap?: Map<string, PopulatedCollegeLike>,
    projectCountMap?: Map<string, number>
): SerializedProfileMembership[] {
    return sortMembershipsByPriority(members).map((member) => {
        const collegeKey = getCollegeKey(member.collegeId);
        const college = isPopulatedCollege(member.collegeId)
            ? member.collegeId
            : collegeMap?.get(collegeKey) ?? null;

        return {
            member: {
                name: member.name ?? null,
                role: member.role ?? null,
                status: member.status ?? null,
                programmingLevel: member.programmingLevel ?? null,
                githubUsername: member.githubUsername ?? null,
                stylusModulesCompleted: member.stylusModulesCompleted ?? 0,
                contractsDeployed: member.contractsDeployed ?? 0,
                totalScore: member.totalScore ?? 0,
                individualRank: member.individualRank ?? null,
                joinedAt: member.createdAt,
            },
            college,
            projectCount: projectCountMap?.get(collegeKey) ?? 0,
        };
    });
}
