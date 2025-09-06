import { NextRequest, NextResponse } from "next/server";
import { getUsersPage } from "@/app/actions/profile";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await getUsersPage(body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
