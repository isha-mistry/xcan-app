/**
 * SWR fetcher for authenticated admin API routes.
 *
 * Unlike a bare `fetch().then(r => r.json())`, this fetcher **throws** on
 * non-OK responses so that SWR can distinguish success from failure.  When a
 * background revalidation fails (e.g. transient 401), SWR keeps the
 * previously-cached data instead of overwriting it with the error payload.
 */
export async function adminFetcher(url: string): Promise<any> {
    const res = await fetch(url, { credentials: 'include' });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const err = new Error(body?.error || `Request failed (${res.status})`) as Error & {
            status: number;
        };
        err.status = res.status;
        throw err;
    }

    return res.json();
}

/** Default SWR options for admin pages that should stay up-to-date. */
export const ADMIN_SWR_OPTIONS = {
    refreshInterval: 30_000,
    revalidateOnFocus: true,
    errorRetryCount: 3,
    keepPreviousData: true,
};

/** SWR options for admin pages where auto-refresh is not needed. */
export const ADMIN_SWR_STATIC_OPTIONS = {
    revalidateOnFocus: true,
    errorRetryCount: 3,
    keepPreviousData: true,
};
