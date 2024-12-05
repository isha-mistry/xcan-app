import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const { delegatorAddress, toAddress } = await req.json();

  if (!delegatorAddress || !toAddress) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  try {
    const myHeaders = new Headers();
    myHeaders.append("x-api-key", process.env.CPI_API_KEY!);

    const requestOptions: any = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    const response = await fetch(
      `https://power-index-api.vercel.app/api/calculate-temp-cpi?delegatorAddress=${delegatorAddress}&toAddress=${toAddress}`,
      requestOptions
    );
    const result = await response.json();
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
