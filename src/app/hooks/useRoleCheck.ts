import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useIsSuperAdmin(enabled: boolean) {
    const { data, isLoading } = useSWR(
        enabled ? '/api/auth/role-check' : null,
        fetcher,
        { revalidateOnFocus: false, revalidateIfStale: false, dedupingInterval: 60_000 }
    );
    return { isSuperAdmin: data?.isSuperAdmin === true, isLoading };
}
