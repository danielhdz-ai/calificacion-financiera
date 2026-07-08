import type { NextRequest } from "next/server";
import { notariasHandlers } from "@/lib/gscapital/sync-route";

export async function GET(request: NextRequest) {
  return notariasHandlers.GET(request);
}

export async function POST(request: NextRequest) {
  return notariasHandlers.POST(request);
}
