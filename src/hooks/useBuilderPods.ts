import useSWR, { type SWRConfiguration } from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const staleConfig: SWRConfiguration = {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
    errorRetryCount: 0,
};

export function useMyMembership(address: string | undefined) {
    return useSWR(
        address ? "/api/builder-pods/members/me" : null,
        fetcher,
        staleConfig
    );
}

export function useCollegeDetails(slug: string | null | undefined) {
    return useSWR(
        slug ? `/api/builder-pods/colleges/${slug}` : null,
        fetcher,
        { refreshInterval: 30_000 }
    );
}

export function useCollegesList() {
    return useSWR("/api/builder-pods/colleges", fetcher, {
        refreshInterval: 30_000,
    });
}

export function usePodLeaderboard() {
    return useSWR("/api/builder-pods/leaderboard/pods", fetcher);
}

export function useIndividualLeaderboard(limit = 50) {
    return useSWR(
        `/api/builder-pods/leaderboard/individuals?limit=${limit}`,
        fetcher
    );
}

export function useBuilderProfile(walletAddress: string | null | undefined) {
    return useSWR(
        walletAddress ? `/api/builder-pods/profile/${walletAddress}` : null,
        fetcher
    );
}

export function useAnalyticsSummary() {
    return useSWR("/api/builder-pods/analytics/summary", fetcher, {
        refreshInterval: 60000,
    });
}
