import { NextRequest, NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";

const privyClient = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_SECRET!
);

const routeConfig = {
  proxy: {
    authenticated: [],
    apiKeyOnly: ["/calculate-cpi"],
    public: [],
  },
};

function setCorsHeaders(response: NextResponse, origin: string | null) {
  response.headers.set("Access-Control-Allow-Origin", origin || "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-api-key"
  );
  response.headers.set("Referrer-Policy", "strict-origin");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");
  const apiKey = request.headers.get("x-api-key");
  const authHeader = request.headers.get("Authorization");
  const isProxyRoute = routeConfig.proxy.authenticated.some((route) =>
    pathname.startsWith(route)
  );
  if (isProxyRoute) {
    const privyToken = authHeader?.replace("Bearer ", "");
    if (!privyToken) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    try {
      // Verify Privy token and get user
      const verifiedUser = await privyClient.verifyAuthToken(privyToken);
      const user = await privyClient.getUserById(verifiedUser.userId);
      // Only check for GitHub OAuth
      const githubAccount = user.linkedAccounts.find(
        (account) => account.type === "github_oauth"
      );
      if (!githubAccount) {
        return new NextResponse(
          JSON.stringify({ error: "GitHub account not linked to user" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } catch (error) {
      console.error("Authentication error:", error);
      return new NextResponse(
        JSON.stringify({ error: "Authentication failed" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } else {
    if (!apiKey || apiKey !== process.env.CHORA_CLUB_API_KEY) {
      console.log("Direct API access not allowed");
      return new NextResponse(
        JSON.stringify({ error: "Direct API access not allowed" }),
        { status: 403 }
      );
    }
  }
  const response = NextResponse.next();
  setCorsHeaders(response, origin);
  return response;
}

export const config = {
  matcher: [
    "/api/proxy/:path*",
    "/api/attest-onchain/:path*",
    "/api/book-slot/:path*",
    "/api/calculate-cpi/:path*",
    "/api/calculate-temp-cpi/:path*",
    "/api/delegate-follow/:path*",
    "/api/delete-office-hours/:path*",
    "/api/edit-office-hours/:path*",
    "/api/get-attendee-individual/:path*",
    "/api/get-meeting/:path*",
    "/api/get-officehours-address/:path*",
    "/api/get-session-data/:path*",
    "/api/get-sessions/:path*",
    "/api/get-specific-officehours/:path*",
    "/api/notifications/:path*",
    "/api/office-hours/:path*",
    "/api/profile/:path*",
    "/api/report-session/:path*",
    "/api/search-officehours/:path*",
    "/api/search-session/:path*",
    "/api/store-availability/:path*",
    "/api/submit-vote/:path*",
    "/api/update-attestation-uid/:path*",
    "/api/update-office-hours/:path*",
    "/api/update-recorded-session/:path*",
    "/api/track-delegation/:path*",
  ],
};
