/** Public showcase helpers: slugs, filters, and safe serialization. */

export const PUBLIC_SUBMISSION_STATUSES = [
  "pending",
  "approved",
  "finalist",
  "winner",
  "special_mention",
] as const;

export type PublicSubmissionStatus = (typeof PUBLIC_SUBMISSION_STATUSES)[number];

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type ShowcaseSlugSource = {
  _id?: { toString(): string } | string;
  name?: string;
  city?: string;
  regionSnapshot?: { name?: string; showcaseCity?: string } | null;
};

/** Prefer region name → city → showcase city → event name → id. */
export function getShowcaseSlug(event: ShowcaseSlugSource): string {
  const base =
    event.regionSnapshot?.name ||
    event.city ||
    event.regionSnapshot?.showcaseCity ||
    event.name ||
    (event._id != null ? String(event._id) : "showcase");
  return slugify(base);
}

export function getShowcaseSlugCandidates(event: ShowcaseSlugSource): string[] {
  const candidates = [
    getShowcaseSlug(event),
    event.city ? slugify(event.city) : null,
    event.regionSnapshot?.showcaseCity
      ? slugify(event.regionSnapshot.showcaseCity)
      : null,
    event.regionSnapshot?.name ? slugify(event.regionSnapshot.name) : null,
    event.name ? slugify(event.name) : null,
    event._id != null ? String(event._id) : null,
  ].filter((value): value is string => Boolean(value));

  return [...new Set(candidates)];
}

export function matchesShowcaseSlug(
  event: ShowcaseSlugSource,
  slug: string,
): boolean {
  if (!slug) return false;
  return getShowcaseSlugCandidates(event).includes(slug);
}

export function truncateWallet(address: string | null | undefined): string | null {
  if (!address || address.length < 10) return address ?? null;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/** Mongo filter for publicly visible submissions. */
export function publicSubmissionMatch(extra: Record<string, unknown> = {}) {
  return {
    isActive: { $ne: false },
    status: { $in: [...PUBLIC_SUBMISSION_STATUSES] },
    ...extra,
  };
}

export function serializePublicSubmission(sub: any) {
  return {
    _id: sub._id,
    showcaseEventId:
      sub.showcaseEventId?._id?.toString?.() ??
      sub.showcaseEventId?.toString?.() ??
      sub.showcaseEventId,
    showcaseName:
      sub.showcaseEventId?.name ??
      sub.showcaseName ??
      null,
    collegeSnapshot: sub.collegeSnapshot
      ? {
          name: sub.collegeSnapshot.name,
          slug: sub.collegeSnapshot.slug,
          podName: sub.collegeSnapshot.podName,
        }
      : null,
    projectSnapshot: sub.projectSnapshot
      ? {
          name: sub.projectSnapshot.name,
          problemStatement: sub.projectSnapshot.problemStatement,
        }
      : null,
    demoLink: sub.demoLink ?? null,
    githubRepo: sub.githubRepo ?? null,
    contractAddress: sub.contractAddress ?? null,
    pitchDeckUrl: sub.pitchDeckUrl ?? null,
    status: sub.status,
    placement: sub.placement ?? null,
    prizeAmountUsd: sub.prizeAmountUsd ?? null,
    createdAt: sub.createdAt,
    submittedBy: truncateWallet(sub.submittedBy),
  };
}

export function enrichShowcaseEvent(
  event: any,
  submissionCount = 0,
): Record<string, unknown> {
  return {
    ...event,
    slug: getShowcaseSlug(event),
    submissionCount,
  };
}
