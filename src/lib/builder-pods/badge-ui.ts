export interface BuilderPodBadgeLike {
    slug?: string | null;
    label?: string | null;
    badgeSnapshot?: {
        slug?: string | null;
        label?: string | null;
    } | null;
}

export interface BuilderPodBadgeUiMeta {
    slug: string;
    label: string;
    description: string;
    imageSrc: string;
    surfaceClass: string;
    titleClass: string;
    linkClass: string;
    glowGradientClass: string;
    auraClass: string;
    imagePanelClass: string;
    buttonClass: string;
}

const badgeImageSrc = (fileName: string) =>
    encodeURI(`/images/builder-pod-badges/${fileName}`);

const DEFAULT_BADGE_META: BuilderPodBadgeUiMeta = {
    slug: "builder_pods_badge",
    label: "Builder Pods Badge",
    description: "Recognized for contributing to the Builder Pods ecosystem.",
    imageSrc: badgeImageSrc("Builder lab participant.png"),
    surfaceClass: "bg-white/[0.03] border-white/10",
    titleClass: "text-white",
    linkClass: "text-white/70 hover:text-white",
    glowGradientClass: "from-sky-400/35 via-cyan-400/20 to-transparent",
    auraClass: "bg-sky-400/18",
    imagePanelClass: "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",
    buttonClass: "bg-white text-black hover:bg-white/90",
};

export const BUILDER_POD_BADGE_META: Record<string, BuilderPodBadgeUiMeta> = {
    builder_lab_participant: {
        slug: "builder_lab_participant",
        label: "Builder Lab Participant",
        description: "Attended an Arbitrum Builder Lab on-campus event.",
        imageSrc: badgeImageSrc("Builder lab participant.png"),
        surfaceClass: "bg-cyan-500/10 border-cyan-400/20",
        titleClass: "text-cyan-100",
        linkClass: "text-cyan-300 hover:text-cyan-200",
        glowGradientClass: "from-cyan-400/45 via-sky-400/20 to-transparent",
        auraClass: "bg-cyan-400/20",
        imagePanelClass: "bg-gradient-to-br from-cyan-950/90 via-slate-950 to-sky-950/85",
        buttonClass: "bg-cyan-300 text-slate-950 hover:bg-cyan-200",
    },
    builder_pod_member: {
        slug: "builder_pod_member",
        label: "Builder Pod Member",
        description: "Active member of a university Arbitrum Builder Pod.",
        imageSrc: badgeImageSrc("Builder pod member.png"),
        surfaceClass: "bg-emerald-500/10 border-emerald-400/20",
        titleClass: "text-emerald-100",
        linkClass: "text-emerald-300 hover:text-emerald-200",
        glowGradientClass: "from-emerald-400/40 via-lime-300/18 to-transparent",
        auraClass: "bg-emerald-400/20",
        imagePanelClass: "bg-gradient-to-br from-emerald-950/90 via-slate-950 to-lime-950/80",
        buttonClass: "bg-emerald-300 text-slate-950 hover:bg-emerald-200",
    },
    builder_pod_lead: {
        slug: "builder_pod_lead",
        label: "Builder Pod Lead",
        description: "Team leader driving a university Arbitrum Builder Pod.",
        imageSrc: badgeImageSrc("Builder pod lead.png"),
        surfaceClass: "bg-yellow-500/10 border-yellow-400/20",
        titleClass: "text-yellow-100",
        linkClass: "text-yellow-300 hover:text-yellow-200",
        glowGradientClass: "from-yellow-300/45 via-orange-400/22 to-transparent",
        auraClass: "bg-orange-400/20",
        imagePanelClass: "bg-gradient-to-br from-yellow-950/90 via-stone-950 to-orange-950/85",
        buttonClass: "bg-yellow-300 text-stone-950 hover:bg-yellow-200",
    },
    regional_showcase_finalist: {
        slug: "regional_showcase_finalist",
        label: "Regional Showcase Finalist",
        description: "Selected as a finalist in a regional Arbitrum showcase.",
        imageSrc: badgeImageSrc("Regional  showcase Finalist.png"),
        surfaceClass: "bg-fuchsia-500/10 border-fuchsia-400/20",
        titleClass: "text-fuchsia-100",
        linkClass: "text-fuchsia-300 hover:text-fuchsia-200",
        glowGradientClass: "from-fuchsia-400/40 via-violet-400/20 to-transparent",
        auraClass: "bg-fuchsia-400/18",
        imagePanelClass: "bg-gradient-to-br from-fuchsia-950/90 via-slate-950 to-violet-950/85",
        buttonClass: "bg-fuchsia-300 text-slate-950 hover:bg-fuchsia-200",
    },
    regional_showcase_winner: {
        slug: "regional_showcase_winner",
        label: "Regional Showcase Winner",
        description: "Winner of a regional Arbitrum Builder Pods showcase.",
        imageSrc: badgeImageSrc("Regional  showcase Winner.png"),
        surfaceClass: "bg-amber-500/10 border-amber-400/20",
        titleClass: "text-amber-100",
        linkClass: "text-amber-300 hover:text-amber-200",
        glowGradientClass: "from-amber-300/45 via-orange-400/22 to-transparent",
        auraClass: "bg-amber-400/20",
        imagePanelClass: "bg-gradient-to-br from-amber-950/90 via-stone-950 to-orange-950/85",
        buttonClass: "bg-amber-300 text-stone-950 hover:bg-amber-200",
    },
};

const humanizeBadgeSlug = (slug: string) =>
    slug
        .split("_")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

export const getBuilderPodBadgeSlug = (badge?: BuilderPodBadgeLike) =>
    badge?.badgeSnapshot?.slug ?? badge?.slug ?? null;

export const getBuilderPodBadgeLabel = (badge?: BuilderPodBadgeLike) => {
    const slug = getBuilderPodBadgeSlug(badge);
    return (
        badge?.badgeSnapshot?.label ??
        badge?.label ??
        (slug ? BUILDER_POD_BADGE_META[slug]?.label ?? humanizeBadgeSlug(slug) : DEFAULT_BADGE_META.label)
    );
};

export const getBuilderPodBadgeMeta = (badge?: BuilderPodBadgeLike): BuilderPodBadgeUiMeta => {
    const slug = getBuilderPodBadgeSlug(badge);
    const meta = (slug && BUILDER_POD_BADGE_META[slug]) || DEFAULT_BADGE_META;

    return {
        ...meta,
        slug: slug ?? meta.slug,
        label: getBuilderPodBadgeLabel(badge),
    };
};
