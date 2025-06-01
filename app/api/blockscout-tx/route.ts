import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hash = searchParams.get("hash");
  if (!hash) {
    return NextResponse.json({ error: "Missing hash param" }, { status: 400 });
  }
  try {
    const res = await fetch(
      `https://sepolia-world.blockscout.com/api/v2/tx/${hash}`,
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: "Blockscout API error", status: res.status },
        { status: res.status },
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch from Blockscout" },
      { status: 500 },
    );
  }
}
