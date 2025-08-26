import type { NextRequest } from "next/server";

export async function GET(_req: NextRequest) {
  return new Response("Not implemented", { status: 501 });
}

export async function DELETE(_req: NextRequest) {
  return new Response("Not implemented", { status: 501 });
}
