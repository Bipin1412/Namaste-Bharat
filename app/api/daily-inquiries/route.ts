import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function getBackendBaseUrl(): string {
  const raw = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
  return raw.replace(/\/+$/, "");
}

function copyResponseHeaders(upstream: Response): Headers {
  const headers = new Headers();
  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() === "transfer-encoding") return;
    headers.set(key, value);
  });
  return headers;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.toString();
  const upstream = await fetch(
    `${getBackendBaseUrl()}/api/daily-inquiries${query ? `?${query}` : ""}`,
    {
    method: "GET",
    cache: "no-store",
    }
  ).catch(() => null);

  if (!upstream) {
    return NextResponse.json(
      { error: { message: "Daily inquiry service is temporarily unavailable." } },
      { status: 502 }
    );
  }

  const body = await upstream.arrayBuffer();
  return new NextResponse(body, {
    status: upstream.status,
    headers: copyResponseHeaders(upstream),
  });
}
