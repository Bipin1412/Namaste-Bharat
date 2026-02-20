import { NextResponse } from "next/server";

export function parseNumberParam(
  value: string | null,
  fallback: number,
  min: number,
  max: number
): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, min), max);
}

export function parseBooleanParam(value: string | null): boolean | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1") {
    return true;
  }
  if (normalized === "false" || normalized === "0") {
    return false;
  }

  return undefined;
}

export function jsonError(
  status: number,
  message: string,
  details?: unknown
) {
  return NextResponse.json(
    {
      error: {
        message,
        details: details ?? null,
      },
    },
    { status }
  );
}
