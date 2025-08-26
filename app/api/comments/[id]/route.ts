import { NextResponse } from "next/server";

export async function GET({ params }: { params: { id: string } }) {
  return NextResponse.json({ message: `GET comment ${params.id} - Not Implemented` }, { status: 501 });
}

export async function DELETE({ params }: { params: { id: string } }) {
  return NextResponse.json({ message: `DELETE comment ${params.id} - Not Implemented` }, { status: 501 });
}
