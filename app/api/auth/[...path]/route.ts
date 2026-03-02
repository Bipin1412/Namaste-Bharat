import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function getBackendBaseUrl(): string {
  const raw = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
  return raw.replace(/\/+$/, "");
}

function copyRequestHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  const allowed = ["authorization", "content-type", "accept"];
  for (const name of allowed) {
    const value = request.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function copyResponseHeaders(upstream: Response): Headers {
  const headers = new Headers();
  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() === "transfer-encoding") {
      return;
    }
    headers.set(key, value);
  });
  return headers;
}

async function proxy(request: NextRequest, path: string[]) {
  const backendBaseUrl = getBackendBaseUrl();
  const pathname = path.join("/");
  const upstreamUrl = `${backendBaseUrl}/api/auth/${pathname}${request.nextUrl.search}`;
  const method = request.method.toUpperCase();
  const body =
    method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();
  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method,
      headers: copyRequestHeaders(request),
      body: body && body.byteLength > 0 ? body : undefined,
      cache: "no-store",
    });
  } catch (_error) {
    return NextResponse.json(
      {
        error: {
          message: "Authentication service is temporarily unavailable.",
        },
      },
      { status: 502 }
    );
  }

  const responseBody = await upstream.arrayBuffer();
  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: copyResponseHeaders(upstream),
  });
}

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}
