import showcasesData from "@/data/builder-pods/showcases.json";

export interface ShowcaseCollege {
  shortName: string;
  name: string;
  city: string;
  collegeSlug: string | null;
}

export interface ShowcaseAgendaItem {
  time: string;
  title: string;
  description: string;
}

export interface ShowcasePrizeBreakdown {
  place: string;
  amountUsd: number;
}

export interface ShowcaseJudgingCriterion {
  title: string;
  description: string;
}

export interface ShowcaseDetails {
  slug: string;
  name: string;
  subtitle: string;
  tagline: string;
  city: string;
  region: string;
  status: "upcoming" | "open" | "live" | "completed";
  date: string;
  day: string;
  time: string;
  timeStart: string;
  timeEnd: string;
  timezone: string;
  format: string;
  podsPresenting: number;
  venue: string | null;
  poster: string;
  infoBanner: string;
  joinLink: string;
  joinLinkLabel: string;
  presentedBy: string;
  partners: string[];
  prizePool: {
    totalUsd: number;
    breakdown: ShowcasePrizeBreakdown[];
  };
  colleges: ShowcaseCollege[];
  agenda: ShowcaseAgendaItem[];
  outcomes: string[];
  judgingCriteria: ShowcaseJudgingCriterion[];
  description: string;
}

const showcases = showcasesData.showcases as ShowcaseDetails[];

export function getAllShowcaseDetails(): ShowcaseDetails[] {
  return showcases;
}

export function getShowcaseDetailsBySlug(
  slug: string
): ShowcaseDetails | undefined {
  const normalized = slug?.toLowerCase()?.trim();
  if (!normalized) return undefined;
  return showcases.find((s) => s.slug === normalized);
}

export function getShowcaseDetailsByCity(
  city: string
): ShowcaseDetails | undefined {
  const normalized = city?.toLowerCase()?.trim();
  if (!normalized) return undefined;
  return showcases.find(
    (s) =>
      s.city.toLowerCase() === normalized ||
      s.region.toLowerCase().includes(normalized)
  );
}

export function formatShowcaseDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
