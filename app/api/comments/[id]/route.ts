import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  void req;
  const { id } = await context.params;
  return NextResponse.json({ message: `GET comment ${id} - Not Implemented` }, { status: 501 });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  void req;
  const { id } = await context.params;
  return NextResponse.json({ message: `DELETE comment ${id} - Not Implemented` }, { status: 501 });
}
