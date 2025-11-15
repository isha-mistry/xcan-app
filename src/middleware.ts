import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// import { getToken } from "next-auth/jwt";
import { PrivyClient } from "@privy-io/server-auth";

const allowedOrigins = [
  process.env.NEXT_PUBLIC_LOCAL_BASE_URL!,
  process.env.NEXT_PUBLIC_HOSTED_BASE_URL!,
  process.env.NEXT_PUBLIC_MIDDLEWARE_BASE_URL!,
  process.env.NEXT_PUBLIC_LOCAL_MEETING_APP_URL!,
  process.env.NEXT_PUBLIC_HOSTED_MEETING_APP_URL!,
  process.env.NEXT_PUBLIC_LOCAL_REQUIRED_URL!,
  process.env.NEXT_PUBLIC_LOCAL_REQUIRED_URL!,
].filter(Boolean);

console.log("allowedOrigins", allowedOrigins);
const privyClient = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_SECRET!
);

const routeConfig = {
  proxy: {
    // Routes that need full authentication (token + wallet)
    authenticated: [
      // ... add other routes that need authentication
    ],
    // Routes that only need API key
    apiKeyOnly: [
      "/calculate-cpi",
      // ... add other routes that only need API key
    ],
    // Public routes that need no authentication
    public: [
      // ... add other public routes
    ],
  },
};
// Set CORS headers
function setCorsHeaders(response: NextResponse, origin: string | null) {
  response.headers.set("Access-Control-Allow-Origin", origin || "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-wallet-address, x-api-key"
  );
  response.headers.set("Referrer-Policy", "strict-origin");
}

export async function middleware(request: NextRequest) {
  const { origin, pathname } = request.nextUrl;
  const apiKey = request.headers.get("x-api-key");
  const authHeader = request.headers.get("Authorization");

  // CORS preflight request handler
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin || "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, x-wallet-address, x-api-key",
        "Referrer-Policy": "strict-origin",
      },
    });
  }

  // Origin validation
  if (!origin || !allowedOrigins.includes(origin)) {
    return new NextResponse(
      JSON.stringify({ error: "Unknown origin request. Forbidden" }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin,
          "Referrer-Policy": "strict-origin",
        },
      }
    );
  }

  // Proxy route authentication
  const isProxyRoute = pathname.startsWith("/api/proxy/");
  const isApiKeyOnlyRoute = routeConfig.proxy.apiKeyOnly.some((route) =>
    pathname.includes(route)
  );

  if (request.method === "GET" || isApiKeyOnlyRoute) {
    const response = NextResponse.next();
    setCorsHeaders(response, origin);
    return response;
  }

  if (isProxyRoute) {
    // GET requests and API key only routes can pass through

    // Validate Privy token for other proxy routes
    const privyToken = authHeader?.replace("Bearer ", "");
    const walletAddress = request.headers.get("x-wallet-address");

    // Check token presence
    if (!privyToken) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate wallet address
    if (!walletAddress) {
      return new NextResponse(
        JSON.stringify({ error: "Wallet address not provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    try {
      // Verify Privy token and get user
      const verifiedUser = await privyClient.verifyAuthToken(privyToken);
      const user = await privyClient.getUserById(verifiedUser.userId);

      // Find linked wallet that matches the provided address
      const linkedWallet = user.linkedAccounts
        .filter((account) => account.type === "wallet")
        .find(
          (wallet) =>
            wallet.address?.toLowerCase() === walletAddress.toLowerCase()
        );

      if (!linkedWallet) {
        console.log(
          `Forbidden access attempt: Wallet address ${walletAddress} not linked to user ${verifiedUser.userId}`
        );
        return new NextResponse(
          JSON.stringify({ error: "Invalid wallet address" }),
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
    // Non-proxy routes require API key
    if (!apiKey || apiKey !== process.env.CHORA_CLUB_API_KEY) {
      console.log("Direct API access not allowed");
      return new NextResponse(
        JSON.stringify({ error: "Direct API access not allowed" }),
        { status: 403 }
      );
    }
  }

  // Allow request to proceed
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
    "/api/upload-video/:path*",
  ],
};
