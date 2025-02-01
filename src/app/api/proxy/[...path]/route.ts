import { BASE_URL } from "@/config/constants";
import { NextRequest, NextResponse } from "next/server";

async function handler(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const method = request.method;
  const searchParams = request.nextUrl.searchParams.toString();

  let requestBody;
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const contentType = request.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      try {
        requestBody = await request.json();
      } catch (error) {
        console.log("No JSON body or empty body");
      }
    }
  }

  try {
    // Filter out problematic headers
    const headers = Object.fromEntries(
      Array.from(request.headers.entries()).filter(
        ([key]) =>
          ![
            "connection",
            "content-length",
            "host",
            "transfer-encoding",
          ].includes(key.toLowerCase())
      )
    );

    const url = `${BASE_URL}/api/${path}${
      searchParams ? `?${searchParams}` : ""
    }`;

    const response = await fetch(url, {
      method,
      headers: {
        ...headers,
        "x-api-key": `${process.env.CHORA_CLUB_API_KEY}`,
        "Content-Type": "application/json",
      },
      ...(requestBody && { body: JSON.stringify(requestBody) }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("API request failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
