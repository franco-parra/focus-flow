import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/api/auth";

export async function POST(request: Request) {
  try {
    const credentials = await request.json();
    const data = await authenticateUser(credentials);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}
